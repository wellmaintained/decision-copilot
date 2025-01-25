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

const decisionsRepository = new FirestoreDecisionsRepository();

export function useDecision(decisionId: string) {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;

  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scope: DecisionScope = { organisationId, teamId, projectId };

  useEffect(() => {
    const unsubscribe = decisionsRepository.subscribeToOne(
      decisionId,
      (decision: Decision | null) => {
        setDecision(decision);
        setLoading(false);
        setError(null);
      },
      (error: Error) => {
        setError(error);
        setLoading(false);
      },
      scope,
    );

    return () => unsubscribe();
  }, [organisationId, teamId, projectId, decisionId]);

  const updateDecisionTitle = async (title: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ title }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDescription = async (description: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ description }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionCost = async (cost: Cost) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ cost }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionReversibility = async (reversibility: Reversibility) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ reversibility }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDriver = async (driverStakeholderId: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.setDecisionDriver(driverStakeholderId),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateStakeholders = async (stakeholders: DecisionStakeholderRole[]) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ stakeholders }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const addStakeholder = async (
    stakeholderId: string,
    role: DecisionStakeholderRole["role"] = "observer"
  ) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.addStakeholder(stakeholderId, role),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const removeStakeholder = async (stakeholderId: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.removeStakeholder(stakeholderId),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionMethod = async (method: DecisionMethod) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ decisionMethod: method }),
        scope,
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    decision,
    loading,
    error,
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionDriver,
    updateStakeholders,
    updateDecisionMethod,
    addStakeholder,
    removeStakeholder,
  };
}
