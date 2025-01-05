import { useEffect, useState, useMemo } from 'react';
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository';
import { Decision, DecisionProps, Cost, Reversibility, DecisionMethod, Stakeholder, Criterion, Option } from '@/lib/domain/Decision';

export function useDecisions() {
  const [decisions, setDecisions] = useState<Decision[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const repository = useMemo(() => new FirestoreDecisionsRepository(), []);

  useEffect(() => {
    const unsubscribe = repository.subscribeToAll(
      (updatedDecisions) => {
        setDecisions(updatedDecisions);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [repository]);

  async function createDecision(props: Omit<DecisionProps, 'id' | 'createdAt' | 'status'>) {
    try {
      const newDecision = Decision.create({
        ...props,
        id: crypto.randomUUID(),
        createdAt: new Date(),
        status: 'draft'
      });
      await repository.createDecision(newDecision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionTitle(decision: Decision, newTitle: string) {
    try {
      decision.updateTitle(newTitle);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionDescription(decision: Decision, newDescription: string | undefined) {
    try {
      decision.updateDescription(newDescription);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionCost(decision: Decision, newCost: Cost) {
    try {
      decision.updateCost(newCost);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionReversibility(decision: Decision, newReversibility: Reversibility) {
    try {
      decision.updateReversibility(newReversibility);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionCriteria(decision: Decision, newCriteria: Criterion[]) {
    try {
      decision.updateCriteria(newCriteria);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionOptions(decision: Decision, newOptions: Option[]) {
    try {
      decision.updateOptions(newOptions);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateFinalDecision(decision: Decision, newDecision: string | undefined) {
    try {
      decision.updateDecision(newDecision);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateDecisionMethod(decision: Decision, newMethod: DecisionMethod | undefined) {
    try {
      decision.updateDecisionMethod(newMethod);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function updateStakeholders(decision: Decision, newStakeholders: Stakeholder[]) {
    try {
      decision.updateStakeholders(newStakeholders);
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function publishDecision(decision: Decision) {
    try {
      decision.publish();
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  async function unpublishDecision(decision: Decision) {
    try {
      decision.unpublish();
      await repository.updateDecision(decision);
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }

  return {
    decisions,
    loading,
    error,
    createDecision,
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionCriteria,
    updateDecisionOptions,
    updateFinalDecision,
    updateDecisionMethod,
    updateStakeholders,
    publishDecision,
    unpublishDecision,
  };
} 