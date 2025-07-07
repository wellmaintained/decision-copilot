import { Stakeholder, StakeholderProps } from './Stakeholder';
import { Decision, StakeholderRole } from './Decision';

export class EmailAlreadyExistsError extends Error {
  constructor(email: string) {
    super(`A stakeholder with email ${email} already exists`);
    this.name = 'EmailAlreadyExistsError';
  }
}

export interface StakeholderWithRole extends Stakeholder {
  role: StakeholderRole;
}

export interface StakeholdersRepository {
  create(props: Omit<StakeholderProps, 'id'>): Promise<Stakeholder>;
  getById(id: string): Promise<Stakeholder | null>;
  getByEmail(email: string): Promise<Stakeholder | null>;
  update(stakeholder: Stakeholder): Promise<void>;
  delete(id: string): Promise<void>;
  getStakeholdersForDecision(decision: Decision): Promise<StakeholderWithRole[]>;
  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void;
} 