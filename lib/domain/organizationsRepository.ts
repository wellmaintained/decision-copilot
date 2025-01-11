import { Organization, OrganizationProps } from '@/lib/domain/Organization'

export interface OrganizationsRepository {
  create(props: Omit<OrganizationProps, 'id'>): Promise<Organization>
  getById(id: string): Promise<Organization | null>
  getForStakeholder(stakeholderId: string): Promise<Organization[]>
  update(organization: Organization): Promise<void>
  delete(id: string): Promise<void>
} 