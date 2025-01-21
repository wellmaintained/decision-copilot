import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A stakeholder with email ${email} already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export interface StakeholdersRepository {
  create(props: Omit<StakeholderProps, 'id'>): Promise<Stakeholder>;
  getById(id: string): Promise<Stakeholder | null>;
  getByEmail(email: string): Promise<Stakeholder | null>;
  update(stakeholder: Stakeholder): Promise<void>;
  delete(id: string): Promise<void>;
  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void;
} 