import { useState, useEffect } from 'react';
import { Decision, Cost, Reversibility, DecisionStakeholderRole, DecisionProps } from '@/lib/domain/Decision';
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository';

const decisionsRepository = new FirestoreDecisionsRepository();

export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = decisionsRepository.subscribeToAll(
      (decisions) => {
        setDecisions(decisions);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const updateDecisionTitle = async (decision: Decision, title: string) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          title,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  const updateDecisionDescription = async (decision: Decision, description: string) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          description,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  const updateDecisionCost = async (decision: Decision, cost: Cost) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          cost,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  const updateDecisionReversibility = async (decision: Decision, reversibility: Reversibility) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          reversibility,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  const updateStakeholders = async (decision: Decision, stakeholders: DecisionStakeholderRole[]) => {
    try {
      await decisionsRepository.updateDecision(
        decision.with({
          stakeholders,
          updatedAt: new Date(),
        })
      );
    } catch (error) {
      setError(error as Error);
    }
  };

  const createDecision = async (): Promise<Decision> => {
    try {
      return await decisionsRepository.createDecision();
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const deleteDecision = async (decisionId: string): Promise<void> => {
    try {
      await decisionsRepository.deleteDecision(decisionId);
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