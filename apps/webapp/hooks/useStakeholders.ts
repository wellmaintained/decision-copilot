import { useState, useEffect } from 'react';
import { Stakeholder, StakeholderProps } from '@decision-copilot/domain/Stakeholder';
import { Decision } from '@decision-copilot/domain/Decision';
import { StakeholderWithRole } from '@decision-copilot/domain/stakeholdersRepository';
import { stakeholdersRepository } from '@/lib/repositories';

export function useStakeholders() {
  const [stakeholders, setStakeholders] = useState<Stakeholder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const addStakeholder = async (stakeholder: StakeholderProps) => {
    const newStakeholder = await stakeholdersRepository.create(stakeholder)
    console.log('newStakeholder', newStakeholder);
    setStakeholders([...stakeholders, newStakeholder])
  }

  const updateStakeholder = async (stakeholder: Stakeholder) => {
    await stakeholdersRepository.update(stakeholder);
    setStakeholders(stakeholders.map(s => s.id === stakeholder.id ? stakeholder : s))
  }

  const removeStakeholder = async (id: string) => {
    await stakeholdersRepository.delete(id);
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