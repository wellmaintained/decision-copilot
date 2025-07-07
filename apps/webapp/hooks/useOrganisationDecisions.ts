import { useState, useEffect } from "react";
import { Decision } from "@decision-copilot/domain/Decision";
import { FirestoreDecisionsRepository } from "@decision-copilot/infrastructure";
import { DecisionScope } from "@decision-copilot/domain/decisionsRepository";
import { useAuth } from "@/hooks/useAuth";
import { FirestoreStakeholdersRepository } from "@decision-copilot/infrastructure";

const decisionsRepository = new FirestoreDecisionsRepository();

export function useOrganisationDecisions(organisationId: string) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const scope: DecisionScope = { organisationId };

  useEffect(() => {
    if (!organisationId) {
      setLoading(false);
      return () => {};
    }

    const unsubscribe = decisionsRepository.subscribeToAll(
      (decisions) => {
        setDecisions(decisions);
        setLoading(false);
        setError(null);
      },
      (error) => {
        setError(error);
        setLoading(false);
      },
      scope,
    );

    return () => unsubscribe();
  }, [organisationId]);

  const createDecision = async () => {
    try {
      if (!user || !user.email) {
        throw new Error("Unable to create new decision for currently logged in user: User not found or email not found");
      }
      const stakeholdersRepository = new FirestoreStakeholdersRepository();
      const userStakeholder = await stakeholdersRepository.getByEmail(user.email);
      if (!userStakeholder) {
        throw new Error("Unable to create new decision - cannot find stakeholder with same email as user");
      }
      const newDecision = Decision.createEmptyDecision({
        organisationId,
      });
      const decisionWithDriver = newDecision.setDecisionDriver(userStakeholder.id);
      return await decisionsRepository.create(decisionWithDriver.withoutId(), scope);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const deleteDecision = async (decisionId: string) => {
    try {
      await decisionsRepository.delete(decisionId, scope);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    decisions,
    loading,
    error,
    createDecision,
    deleteDecision,
  };
} 