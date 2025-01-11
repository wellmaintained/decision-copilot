import { StakeholderTeam, StakeholderTeamProps } from '@/lib/domain/StakeholderTeam'

export interface StakeholderTeamsRepository {
  create(props: Omit<StakeholderTeamProps, 'id'>): Promise<StakeholderTeam>
  getById(id: string): Promise<StakeholderTeam | null>
  getByStakeholderId(stakeholderId: string): Promise<StakeholderTeam[]>
  getByTeamId(teamId: string): Promise<StakeholderTeam[]>
  getByOrganisationId(organisationId: string): Promise<StakeholderTeam[]>
  delete(id: string): Promise<void>
} 