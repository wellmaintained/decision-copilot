import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Decision } from '@/lib/domain/Decision';
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository';

const decisionsRepository = new FirestoreDecisionsRepository();

export function useProjectDecisions() {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const teamId = params.teamId as string;
  const projectId = params.projectId as string;

  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const scope = { organisationId, teamId, projectId };

  useEffect(() => {
    const scope = { organisationId, teamId, projectId };
    const unsubscribe = decisionsRepository.subscribeToAll(
      (fetchedDecisions) => {
        setDecisions(fetchedDecisions);
        setLoading(false);
        setError(null);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
      scope
    );

    return () => unsubscribe();
  }, [organisationId, teamId, projectId]);

  const createDecision = async (decision: Omit<Decision, 'id'>) => {
    const newDecision = await decisionsRepository.createDecision(decision, scope);
    return newDecision;
  };

  const deleteDecision = async (decisionId: string) => {
    await decisionsRepository.deleteDecision(decisionId, scope);
  };

  return {
    decisions,
    loading,
    error,
    createDecision,
    deleteDecision,
  };
} 