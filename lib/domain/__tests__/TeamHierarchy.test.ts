import { describe, it, expect } from 'vitest'
import { TeamHierarchy, TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'

describe('TeamHierarchy', () => {
  describe('create', () => {
    it('should create a valid team hierarchy', () => {
      // Arrange
      const teams: Record<string, TeamHierarchyNode> = {
        'team-1': {
          id: 'team-1',
          name: 'Leadership Team',
          parentId: null,
          children: {
            'team-2': {
              id: 'team-2',
              name: 'Engineering',
              parentId: 'team-1',
              children: {}
            },
            'team-3': {
              id: 'team-3',
              name: 'Product',
              parentId: 'team-1',
              children: {}
            }
          }
        },
        'team-2': {
          id: 'team-2',
          name: 'Engineering',
          parentId: 'team-1',
          children: {}
        },
        'team-3': {
          id: 'team-3',
          name: 'Product',
          parentId: 'team-1',
          children: {}
        }
      }

      // Act
      const hierarchy = TeamHierarchy.create({ teams })

      // Assert
      expect(hierarchy).toBeDefined()
      expect(hierarchy.teams).toEqual(teams)
    })

    it('should validate team node structure', () => {
      // Arrange
      const invalidTeams = {
        'team-1': {
          id: 'team-1',
          name: 'Leadership Team',
          parentId: null,
          children: {
            'team-2': {
              id: 'team-2',
              // Missing name property
              parentId: 'team-1',
              children: {}
            }
          }
        }
      }

      // Act & Assert
      expect(() => TeamHierarchy.create({ teams: invalidTeams })).toThrow()
    })

    it('should validate parent-child relationships', () => {
      // Arrange
      const invalidTeams = {
        'team-1': {
          id: 'team-1',
          name: 'Leadership Team',
          parentId: null,
          children: {
            'team-2': {
              id: 'team-2',
              name: 'Engineering',
              parentId: 'non-existent-team', // Invalid parent reference
              children: {}
            }
          }
        },
        'team-2': {
          id: 'team-2',
          name: 'Engineering',
          parentId: 'non-existent-team', // Invalid parent reference
          children: {}
        }
      }

      // Act & Assert
      expect(() => TeamHierarchy.create({ teams: invalidTeams })).toThrow()
    })
  })

  describe('addTeam', () => {
    it('should add a team as a root node when parentId is null', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({ teams: {} })
      const newTeam = {
        id: 'team-1',
        name: 'Leadership Team',
        parentId: null
      }

      // Act
      const updatedHierarchy = hierarchy.addTeam(newTeam)

      // Assert
      expect(updatedHierarchy.teams['team-1']).toBeDefined()
      expect(updatedHierarchy.teams['team-1'].name).toBe('Leadership Team')
      expect(updatedHierarchy.teams['team-1'].parentId).toBeNull()
      expect(updatedHierarchy.teams['team-1'].children).toEqual({})
    })

    it('should add a team as a child node when parentId is provided', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {}
          }
        }
      })
      const newTeam = {
        id: 'team-2',
        name: 'Engineering',
        parentId: 'team-1'
      }

      // Act
      const updatedHierarchy = hierarchy.addTeam(newTeam)

      // Assert
      expect(updatedHierarchy.teams['team-1'].children['team-2']).toBeDefined()
      expect(updatedHierarchy.teams['team-1'].children['team-2'].name).toBe('Engineering')
      expect(updatedHierarchy.teams['team-1'].children['team-2'].parentId).toBe('team-1')
      expect(updatedHierarchy.teams['team-1'].children['team-2'].children).toEqual({})
      expect(updatedHierarchy.teams['team-2']).toBeDefined()
    })

    it('should throw an error when adding a team with a non-existent parent', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({ teams: {} })
      const newTeam = {
        id: 'team-2',
        name: 'Engineering',
        parentId: 'non-existent-team'
      }

      // Act & Assert
      expect(() => hierarchy.addTeam(newTeam)).toThrow()
    })
  })

  describe('updateTeam', () => {
    it('should update a team\'s properties', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {}
          }
        }
      })
      const updatedTeamData = {
        id: 'team-1',
        name: 'Executive Leadership',
        parentId: null
      }

      // Act
      const updatedHierarchy = hierarchy.updateTeam(updatedTeamData)

      // Assert
      expect(updatedHierarchy.teams['team-1'].name).toBe('Executive Leadership')
    })

    it('should throw an error when updating a non-existent team', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({ teams: {} })
      const updatedTeamData = {
        id: 'non-existent-team',
        name: 'Some Team',
        parentId: null
      }

      // Act & Assert
      expect(() => hierarchy.updateTeam(updatedTeamData)).toThrow()
    })
  })

  describe('moveTeam', () => {
    it('should move a team to a new parent', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {
              'team-2': {
                id: 'team-2',
                name: 'Engineering',
                parentId: 'team-1',
                children: {}
              }
            }
          },
          'team-2': {
            id: 'team-2',
            name: 'Engineering',
            parentId: 'team-1',
            children: {}
          },
          'team-3': {
            id: 'team-3',
            name: 'Product',
            parentId: null,
            children: {}
          }
        }
      })

      // Act
      const updatedHierarchy = hierarchy.moveTeam('team-2', 'team-3')

      // Assert
      expect(updatedHierarchy.teams['team-1'].children['team-2']).toBeUndefined()
      expect(updatedHierarchy.teams['team-3'].children['team-2']).toBeDefined()
      expect(updatedHierarchy.teams['team-2'].parentId).toBe('team-3')
    })

    it('should throw an error when moving a non-existent team', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {}
          }
        }
      })

      // Act & Assert
      expect(() => hierarchy.moveTeam('non-existent-team', 'team-1')).toThrow()
    })

    it('should throw an error when moving to a non-existent parent', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {
              'team-2': {
                id: 'team-2',
                name: 'Engineering',
                parentId: 'team-1',
                children: {}
              }
            }
          },
          'team-2': {
            id: 'team-2',
            name: 'Engineering',
            parentId: 'team-1',
            children: {}
          }
        }
      })

      // Act & Assert
      expect(() => hierarchy.moveTeam('team-2', 'non-existent-team')).toThrow()
    })
  })

  describe('removeTeam', () => {
    it('should remove a team with no children', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {
              'team-2': {
                id: 'team-2',
                name: 'Engineering',
                parentId: 'team-1',
                children: {}
              }
            }
          },
          'team-2': {
            id: 'team-2',
            name: 'Engineering',
            parentId: 'team-1',
            children: {}
          }
        }
      })

      // Act
      const updatedHierarchy = hierarchy.removeTeam('team-2')

      // Assert
      expect(updatedHierarchy.teams['team-2']).toBeUndefined()
      expect(updatedHierarchy.teams['team-1'].children['team-2']).toBeUndefined()
    })

    it('should throw an error when removing a team with children', () => {
      // Arrange
      const hierarchy = TeamHierarchy.create({
        teams: {
          'team-1': {
            id: 'team-1',
            name: 'Leadership Team',
            parentId: null,
            children: {
              'team-2': {
                id: 'team-2',
                name: 'Engineering',
                parentId: 'team-1',
                children: {
                  'team-3': {
                    id: 'team-3',
                    name: 'Frontend',
                    parentId: 'team-2',
                    children: {}
                  }
                }
              }
            }
          },
          'team-2': {
            id: 'team-2',
            name: 'Engineering',
            parentId: 'team-1',
            children: {
              'team-3': {
                id: 'team-3',
                name: 'Frontend',
                parentId: 'team-2',
                children: {}
              }
            }
          },
          'team-3': {
            id: 'team-3',
            name: 'Frontend',
            parentId: 'team-2',
            children: {}
          }
        }
      })

      // Act & Assert
      expect(() => hierarchy.removeTeam('team-2')).toThrow()
    })
  })
}) 