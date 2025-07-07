import { Organisation, OrganisationProps } from './Organisation'

export interface OrganisationsRepository {
  create(props: Omit<OrganisationProps, 'id'>): Promise<Organisation>
  getById(id: string): Promise<Organisation | null>
  getForStakeholder(stakeholderEmail: string): Promise<Organisation[]>
  update(organisation: Organisation): Promise<void>
  delete(id: string): Promise<void>
  getAll(): Promise<Organisation[]>
} 