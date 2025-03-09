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
      const mockDocSnap = { exists: () => false } as unknown as DocumentSnapshot
      
      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap)
      
      // Act
      const result = await repository.getByOrganisationId(organisationId)
      
      // Assert
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
    
    it('should return the hierarchy when it exists', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockTeams = {
        'team-1': {
          id: 'team-1',
          name: 'Leadership Team',
          parentId: null,
          children: {}
        }
      }
      const mockDocSnap = {
        exists: () => true,
        data: () => ({ teams: mockTeams })
      } as unknown as DocumentSnapshot
      
      // Mock Firebase functions
      vi.mocked(doc).mockReturnValue(mockDocRef)
      vi.mocked(getDoc).mockResolvedValue(mockDocSnap)
      
      // Act
      const result = await repository.getByOrganisationId(organisationId)
      
      // Assert
      expect(result).not.toBeNull()
      expect(result?.teams).toEqual(mockTeams)
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
      
      // Act & Assert
      await expect(repository.getByOrganisationId(organisationId)).rejects.toThrow(mockError)
    })
  })
  
  describe('save', () => {
    it('should save the hierarchy to Firestore', async () => {
      // Arrange
      const organisationId = 'org-1'
      const mockDocRef = { id: 'hierarchy' } as unknown as DocumentReference
      const mockTeams = {
        'team-1': {
          id: 'team-1',
          name: 'Leadership Team',
          parentId: null,
          children: {}
        }
      }
      const hierarchy = TeamHierarchy.create({ teams: mockTeams })
      
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
      expect(setDoc).toHaveBeenCalledWith(mockDocRef, { teams: mockTeams })
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