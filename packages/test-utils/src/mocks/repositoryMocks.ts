/**
 * Team hierarchy interface for testing
 * This mirrors the interfaces from @decision-copilot/domain
 */
export interface TeamHierarchy {
  teams: Record<string, unknown>
}

export interface TeamHierarchyRepository {
  getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null>
  save(organisationId: string, hierarchy: TeamHierarchy): Promise<void>
}

/**
 * Mock implementation of TeamHierarchyRepository for testing
 */
export class MockTeamHierarchyRepository implements TeamHierarchyRepository {
  private hierarchies: Record<string, TeamHierarchy> = {}

  async getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null> {
    return this.hierarchies[organisationId] || null
  }

  async save(organisationId: string, hierarchy: TeamHierarchy): Promise<void> {
    this.hierarchies[organisationId] = hierarchy
  }

  /**
   * Test utility: Clear all stored hierarchies
   */
  clear(): void {
    this.hierarchies = {}
  }

  /**
   * Test utility: Get all stored hierarchies
   */
  getAll(): Record<string, TeamHierarchy> {
    return { ...this.hierarchies }
  }

  /**
   * Test utility: Check if organisation has hierarchy
   */
  has(organisationId: string): boolean {
    return organisationId in this.hierarchies
  }
}

/**
 * Factory function to create a mock repository with pre-populated data
 */
export function createMockTeamHierarchyRepository(
  initialData: Record<string, TeamHierarchy> = {}
): MockTeamHierarchyRepository {
  const repository = new MockTeamHierarchyRepository()
  
  // Pre-populate with initial data
  Object.entries(initialData).forEach(([orgId, hierarchy]) => {
    repository.save(orgId, hierarchy)
  })
  
  return repository
}