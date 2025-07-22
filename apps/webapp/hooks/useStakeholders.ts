import { db } from "@/lib/env";
import { useState, useEffect } from 'react';
import { Stakeholder, StakeholderProps } from '@decision-copilot/domain/Stakeholder';
import { FirestoreStakeholdersRepository } from '@decision-copilot/infrastructure'
import { Decision } from '@decision-copilot/domain/Decision';
import { StakeholderWithRole } from '@decision-copilot/domain/stakeholdersRepository';

const stakeholdersRepository = new FirestoreStakeholdersRepository(db);

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const addStakeholder = async (stakeholder: StakeholderProps) => {
    const repository = new FirestoreStakeholdersRepository(db)
    const newStakeholder = await repository.create(stakeholder)
    console.log('newStakeholder', newStakeholder);
    setStakeholders([...stakeholders, newStakeholder])
  }

  const updateStakeholder = async (stakeholder: Stakeholder) => {
    const repository = new FirestoreStakeholdersRepository(db);
    await repository.update(stakeholder);
    setStakeholders(stakeholders.map(s => s.id === stakeholder.id ? stakeholder : s))
  }

  const removeStakeholder = async (id: string) => {
    const repository = new FirestoreStakeholdersRepository(db);
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