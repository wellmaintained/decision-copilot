import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TeamHierarchy, TeamHierarchyProps } from '@/lib/domain/TeamHierarchy'
import { TeamHierarchyRepository } from '@/lib/domain/TeamHierarchyRepository'

export class FirestoreTeamHierarchyRepository implements TeamHierarchyRepository {
  /**
   * Get the team hierarchy for an organisation
   * @param organisationId The ID of the organisation
   * @returns The team hierarchy or null if not found
   */
  async getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null> {
    try {
      const docRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return TeamHierarchy.create(docSnap.data() as TeamHierarchyProps)
      }
      
      return null
    } catch (error) {
      console.error('Error getting team hierarchy:', error)
      throw error
    }
  }

  /**
   * Save a team hierarchy for an organisation
   * @param organisationId The ID of the organisation
   * @param hierarchy The team hierarchy to save
   */
  async save(organisationId: string, hierarchy: TeamHierarchy): Promise<void> {
    try {
      const docRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
      await setDoc(docRef, { teams: hierarchy.teams })
    } catch (error) {
      console.error('Error saving team hierarchy:', error)
      throw error
    }
  }
} 