import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import {
  Decision,
  Cost,
  Reversibility,
  DecisionStakeholderRole,
  DecisionMethod,
} from "@/lib/domain/Decision";
import { FirestoreDecisionsRepository } from "@/lib/infrastructure/firestoreDecisionsRepository";
import { DecisionScope } from "@/lib/domain/decisionsRepository";
import { useAuth } from "@/hooks/useAuth";

const decisionsRepository = new FirestoreDecisionsRepository();

export function useDecisions() {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const { user } = useAuth();

  const scope: DecisionScope = { organisationId, teamId, projectId };

  useEffect(() => {
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
  }, [organisationId, teamId, projectId]);

  const createDecision = async () => {
    try {
      if (!user) {
        throw new Error("Unable to create new decision for currently logged in user: User not found");
      }
      const emptyDecision = Decision.createEmptyDecision({
        driverStakeholderId: user.uid,
      });
      return await decisionsRepository.create(emptyDecision, scope);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionTitle = async (decision: Decision, title: string) => {
    try {
      await decisionsRepository.update(
        decision.with({
          title,
          updatedAt: new Date(),
        }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDescription = async (
    decision: Decision,
    description: string,
  ) => {
    try {
      await decisionsRepository.update(
        decision.with({
          description,
          updatedAt: new Date(),
        }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionCost = async (decision: Decision, cost: Cost) => {
    try {
      await decisionsRepository.update(
        decision.with({
          cost,
          updatedAt: new Date(),
        }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionReversibility = async (
    decision: Decision,
    reversibility: Reversibility,
  ) => {
    try {
      await decisionsRepository.update(
        decision.with({
          reversibility,
          updatedAt: new Date(),
        }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDriver = async (
    decision: Decision,
    driverStakeholderId: string,
  ) => {
    await decisionsRepository.update(
      decision.with({ driverStakeholderId }),
      scope,
    );
  };

  const updateStakeholders = async (
    decision: Decision,
    stakeholders: DecisionStakeholderRole[],
  ) => {
    try {
      await decisionsRepository.update(
        decision.with({
          stakeholders,
          updatedAt: new Date(),
        }),
        scope,
      );
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

  const updateDecisionMethod = async (
    decision: Decision,
    method: DecisionMethod,
  ) => {
    try {
      await decisionsRepository.update(
        decision.with({
          decisionMethod: method,
          updatedAt: new Date(),
        }),
        scope,
      );
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
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionDriver,
    updateStakeholders,
    deleteDecision,
    updateDecisionMethod,
  };
}
