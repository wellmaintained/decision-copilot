import { Stakeholder } from '@/lib/domain/Stakeholder';

export interface StakeholdersRepository {
  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void;
} 