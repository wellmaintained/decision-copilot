import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { doc, getDoc, setDoc, DocumentReference, DocumentSnapshot } from 'firebase/firestore'
import { TeamHierarchy } from '@/lib/domain/TeamHierarchy'
import { FirestoreTeamHierarchyRepository } from '@/lib/infrastructure/firestoreTeamHierarchyRepository'

// Mock Firebase
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: vi.fn(),
  setDoc: vi.fn()
}))

vi.mock('@/lib/firebase', () => ({
  db: {}
}))

describe('FirestoreTeamHierarchyRepository', () => {
  let repository: FirestoreTeamHierarchyRepository

  beforeEach(() => {
    repository = new FirestoreTeamHierarchyRepository()
    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.resetAllMocks()
  })

  describe('getByOrganisationId', () => {
    it('should return null when no hierarchy exists', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockDocSnap = { exists: () => false } as unknown as DocumentSnapsho

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap)

      // Ac
      const result = await repository.getByOrganisationId(organisationId)

      // Asser
      expect(result).toBeNull()
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        'organisations',
        organisationId,
        'teamHierarchies',
        'hierarchy'
      )
      expect(getDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('should return null when document exists but has no rootTeams', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ someOtherData: 'value' })
      } as unknown as DocumentSnapsho

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap)

      // Ac
      const result = await repository.getByOrganisationId(organisationId)

      // Asser
      expect(result).toBeNull()
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        'organisations',
        organisationId,
        'teamHierarchies',
        'hierarchy'
      )
      expect(getDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('should return the hierarchy when it exists in hierarchical format', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockRootTeams = {
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
        }
      }
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ rootTeams: mockRootTeams })
      } as unknown as DocumentSnapsho

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap)

      // Ac
      const result = await repository.getByOrganisationId(organisationId)

      // Asser
      expect(result).not.toBeNull()
      expect(result?.teams['team-1']).toBeDefined()
      expect(result?.teams['team-2']).toBeDefined()
      expect(result?.teams['team-1'].children['team-2']).toBeDefined()
      expect(result?.teams['team-2'].parentId).toBe('team-1')
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        'organisations',
        organisationId,
        'teamHierarchies',
        'hierarchy'
      )
      expect(getDoc).toHaveBeenCalledWith(mockDocRef)
    })

    it('should throw an error when Firebase fails', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockError = new Error('Firebase error')

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockRejectedValue(mockError)

      // Act & Asser
      await expect(repository.getByOrganisationId(organisationId)).rejects.toThrow(mockError)
    })
  })

  describe('save', () => {
    it('should save the hierarchy to Firestore in hierarchical format', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockTeams = {
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
      const hierarchy = TeamHierarchy.create({ teams: mockTeams })

      // Expected hierarchical structure
      const expectedRootTeams = {
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
        }
      }

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(setDoc).mockResolvedValue(undefined)
      
      // Act
      await repository.save(organisationId, hierarchy)
      
      // Assert
      expect(doc).toHaveBeenCalledWith(
        expect.anything(),
        'organisations',
        organisationId,
        'teamHierarchies',
        'hierarchy'
      )
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, { rootTeams: expectedRootTeams })
    })

    it('should throw an error when Firebase fails', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockError = new Error('Firebase error')
      const hierarchy = TeamHierarchy.create({ teams: {} })

      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(setDoc).mockRejectedValue(mockError)
      
      // Act & Assert
      await expect(repository.save(organisationId, hierarchy)).rejects.toThrow(mockError)
    })
  })
})