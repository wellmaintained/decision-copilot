import { TeamHierarchy } from '@/lib/domain/TeamHierarchy'

export interface TeamHierarchyRepository {
  /**
   * Get the team hierarchy for an organisation
   * @param organisationId The ID of the organisation
   * @returns The team hierarchy or null if not found
   */
  getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null>

  /**
   * Save a team hierarchy for an organisation
   * @param organisationId The ID of the organisation
   * @param hierarchy The team hierarchy to save
   */
  save(organisationId: string, hierarchy: TeamHierarchy): Promise<void>
} 