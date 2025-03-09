import { describe, it, expect } from 'vitest'
import { TeamHierarchy } from '@/lib/domain/TeamHierarchy'
import { TeamHierarchyRepository } from '@/lib/domain/TeamHierarchyRepository'

// Mock implementation of the repository for testing
class MockTeamHierarchyRepository implements TeamHierarchyRepository {
  private hierarchies: Record<string, TeamHierarchy> = {}

  async getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null> {
    return this.hierarchies[organisationId] || null
  }

  async save(organisationId: string, hierarchy: TeamHierarchy): Promise<void> {
    this.hierarchies[organisationId] = hierarchy
  }
}

describe('TeamHierarchyRepository', () => {
  describe('getByOrganisationId', () => {
    it('should return null when no hierarchy exists for the organisation', async () => {
      // Arrange
      const repository = new MockTeamHierarchyRepository()
      const organisationId = 'org-1'

      // Act
      const result = await repository.getByOrganisationId(organisationId)

      // Assert
      expect(result).toBeNull()
    })

    it('should return the hierarchy when it exists for the organisation', async () => {
      // Arrange
      const repository = new MockTeamHierarchyRepository()
      const organisationId = 'org-1'
      const hierarchy = TeamHierarchy.create({ teams: {} })
      await repository.save(organisationId, hierarchy)

      // Act
      const result = await repository.getByOrganisationId(organisationId)

      // Assert
      expect(result).not.toBeNull()
      expect(result).toEqual(hierarchy)
    })
  })

  describe('save', () => {
    it('should save a new hierarchy for an organisation', async () => {
      // Arrange
      const repository = new MockTeamHierarchyRepository()
      const organisationId = 'org-1'
      const hierarchy = TeamHierarchy.create({ teams: {} })

      // Act
      await repository.save(organisationId, hierarchy)
      const savedHierarchy = await repository.getByOrganisationId(organisationId)

      // Assert
      expect(savedHierarchy).toEqual(hierarchy)
    })

    it('should update an existing hierarchy for an organisation', async () => {
      // Arrange
      const repository = new MockTeamHierarchyRepository()
      const organisationId = 'org-1'
      
      // Initial hierarchy
      const initialHierarchy = TeamHierarchy.create({ teams: {} })
      await repository.save(organisationId, initialHierarchy)
      
      // Updated hierarchy with a team
      const updatedHierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {}
          }
        }
      })

      // Act
      await repository.save(organisationId, updatedHierarchy)
      const savedHierarchy = await repository.getByOrganisationId(organisationId)

      // Assert
      expect(savedHierarchy).toEqual(updatedHierarchy)
      expect(savedHierarchy).not.toEqual(initialHierarchy)
    })
  })
}) 