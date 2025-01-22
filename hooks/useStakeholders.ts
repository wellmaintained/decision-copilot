import { useState, useEffect } from 'react';
import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';
import { FirestoreStakeholdersRepository } from '@/lib/infrastructure/firestoreStakeholdersRepository';
import { Decision } from '@/lib/domain/Decision';
import { StakeholderWithRole } from '@/lib/domain/stakeholdersRepository';

const stakeholdersRepository = new FirestoreStakeholdersRepository();

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const addStakeholder = async (stakeholder: StakeholderProps) => {
    const repository = new FirestoreStakeholdersRepository()
    const newStakeholder = await repository.create(stakeholder)
    console.log('newStakeholder', newStakeholder);
    setStakeholders([...stakeholders, newStakeholder])
  }

  const updateStakeholder = async (stakeholder: Stakeholder) => {
    const repository = new FirestoreStakeholdersRepository();
    await repository.update(stakeholder);
    setStakeholders(stakeholders.map(s => s.id === stakeholder.id ? stakeholder : s))
  }

  const removeStakeholder = async (id: string) => {
    const repository = new FirestoreStakeholdersRepository();
    await repository.delete(id);
    setStakeholders(stakeholders.filter(s => s.id !== id));
  }

  const getStakeholdersForDecision = async (decision: Decision): Promise<StakeholderWithRole[]> => {
    return stakeholdersRepository.getStakeholdersForDecision(decision);
  }

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
    setStakeholders,
    addStakeholder,
    updateStakeholder,
    removeStakeholder,
    getStakeholdersForDecision,
    loading,
    error,
  };
} 