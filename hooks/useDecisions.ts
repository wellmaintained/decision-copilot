import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Decision, Cost, Reversibility, DecisionStakeholderRole, DecisionProps } from '@/lib/domain/Decision';
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository';

const decisionsRepository = new FirestoreDecisionsRepository();

export function useDecisions() {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scope = { organisationId, teamId, projectId };

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
      scope
    );

    return () => unsubscribe();
  }, [organisationId, teamId, projectId]);

  const createDecision = async (initialData: Partial<Omit<DecisionProps, 'id'>>) => {
    try {
      return await decisionsRepository.createDecision(initialData, scope);
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionTitle = async (decision: Decision, title: string) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          title,
          updatedAt: new Date(),
        }),
        scope
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDescription = async (decision: Decision, description: string) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          description,
          updatedAt: new Date(),
        }),
        scope
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionCost = async (decision: Decision, cost: Cost) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          cost,
          updatedAt: new Date(),
        }),
        scope
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionReversibility = async (decision: Decision, reversibility: Reversibility) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          reversibility,
          updatedAt: new Date(),
        }),
        scope
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateStakeholders = async (decision: Decision, stakeholders: DecisionStakeholderRole[]) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          stakeholders,
          updatedAt: new Date(),
        }),
        scope
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const deleteDecision = async (decisionId: string) => {
    try {
      await decisionsRepository.deleteDecision(decisionId, scope);
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
    updateStakeholders,
    deleteDecision,
  };
} 