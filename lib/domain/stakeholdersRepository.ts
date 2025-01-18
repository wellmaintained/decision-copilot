import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';

export interface StakeholdersRepository {
  create(props: StakeholderProps): Promise<Stakeholder>;
  update(stakeholder: Stakeholder): Promise<Stakeholder>;
  delete(id: string): Promise<void>;
  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void;
} 