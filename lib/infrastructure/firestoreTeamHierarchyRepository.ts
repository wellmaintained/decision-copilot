import { doc, getDoc, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TeamHierarchy, TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'
import { TeamHierarchyRepository } from '@/lib/domain/TeamHierarchyRepository'

// Define types for the hierarchical structure
interface HierarchicalTeamNode {
  id: string
  name: string
  parentId: string | null
  children: Record<string, HierarchicalTeamNode>
  // For any additional properties
  [key: string]: unknown
}

interface FirestoreTeamNode {
  id: string;
  name: string;
  parentId: string | null;
  children: Record<string, FirestoreTeamNode>;
}

export class FirestoreTeamHierarchyRepository implements TeamHierarchyRepository {
  /**
   * Get the team hierarchy for an organisation
   * @param organisationId The ID of the organisation
   * @returns The team hierarchy or null if not found
   */
  async getByOrganisationId(organisationId: string): Promise<TeamHierarchy | null> {
    try {
      const hierarchyRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
      const snapshot = await getDoc(hierarchyRef)
      
      if (!snapshot.exists()) {
        return null
      }
      
      const data = snapshot.data()
      return TeamHierarchy.create({
        teams: this.convertFromFirestore(data.teams || {})
      })
    } catch (error) {
      console.error('Error fetching team hierarchy:', error)
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
      const hierarchyRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
      await setDoc(hierarchyRef, {
        teams: this.convertToFirestore(hierarchy.teams)
      })
    } catch (error) {
      console.error('Error saving team hierarchy:', error)
      throw error
    }
  }

  private convertToFirestore(teams: Record<string, TeamHierarchyNode>): Record<string, FirestoreTeamNode> {
    const result: Record<string, FirestoreTeamNode> = {}
    
    for (const [id, team] of Object.entries(teams)) {
      result[id] = {
        id: team.id,
        name: team.name,
        parentId: team.parentId,
        children: this.convertToFirestore(team.children)
      }
    }
    
    return result
  }

  private convertFromFirestore(data: Record<string, FirestoreTeamNode>): Record<string, TeamHierarchyNode> {
    const result: Record<string, TeamHierarchyNode> = {}
    
    for (const [id, team] of Object.entries(data)) {
      result[id] = {
        id: team.id,
        name: team.name,
        parentId: team.parentId,
        children: this.convertFromFirestore(team.children || {})
      }
    }
    
    return result
  }

  /**
   * Convert flat team structure to hierarchical structure
   * @param teams Flat team structure from domain model
   * @returns Hierarchical structure for Firestore
   */
  private convertFlatToHierarchical(teams: Record<string, TeamHierarchyNode>): Record<string, HierarchicalTeamNode> {
    // Get root teams (teams with no parent)
    const rootTeams = Object.values(teams)
      .filter(team => team.parentId === null)
      .reduce<Record<string, HierarchicalTeamNode>>((acc, team) => {
        // Create a deep copy without the redundant references
        acc[team.id] = this.createHierarchicalTeam(team, teams)
        return acc
      }, {})

    return rootTeams
  }

  /**
   * Recursively create a hierarchical team structure
   * @param team The team to conver
   * @param allTeams All teams in the flat structure
   * @returns Hierarchical team structure
   */
  private createHierarchicalTeam(team: TeamHierarchyNode, allTeams: Record<string, TeamHierarchyNode>): HierarchicalTeamNode {
    // Create a new team object without the children property
    const { children, ...teamWithoutChildren } = team

    // Create a new hierarchical team with children
    return {
      ...teamWithoutChildren,
      children: Object.keys(children).reduce<Record<string, HierarchicalTeamNode>>((acc, childId) => {
        // Recursively convert each child
        acc[childId] = this.createHierarchicalTeam(allTeams[childId], allTeams)
        return acc
      }, {})
    }
  }

  /**
   * Convert hierarchical team structure to flat structure
   * @param rootTeams Hierarchical root teams from Firestore
   * @returns Flat structure for domain model
   */
  private convertHierarchicalToFlat(rootTeams: Record<string, HierarchicalTeamNode>): Record<string, TeamHierarchyNode> {
    const result: Record<string, TeamHierarchyNode> = {}

    // Process each root team
    Object.entries(rootTeams).forEach(([, team]) => {
      this.addTeamToFlatStructure(team, result)
    })

    return result
  }

  /**
   * Recursively add a team and its children to the flat structure
   * @param team The hierarchical team
   * @param result The resulting flat structure
   */
  private addTeamToFlatStructure(team: HierarchicalTeamNode, result: Record<string, TeamHierarchyNode>): void {
    const { children, ...teamWithoutChildren } = team

    // Add the team to the flat structure
    result[team.id] = {
      ...teamWithoutChildren,
      children: {}
    } as TeamHierarchyNode

    // Process each child
    Object.entries(children || {}).forEach(([childId, childTeam]) => {
      // Add the child to the flat structure
      this.addTeamToFlatStructure(childTeam, result)

      // Add the child to the parent's children
      result[team.id].children[childId] = result[childId]
    })
  }
}