import { useState, useEffect } from 'react';
import { Stakeholder } from '@/lib/domain/Stakeholder';
import { FirestoreStakeholdersRepository } from '@/lib/infrastructure/firestoreStakeholdersRepository';

const stakeholdersRepository = new FirestoreStakeholdersRepository();

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = stakeholdersRepository.subscribeToAll(
      (stakeholders) => {
        setStakeholders(stakeholders);
        setLoading(false);
      },
      (error) => {
        setError(error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return {
    stakeholders,
    loading,
    error,
  };
} 