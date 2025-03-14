import { useState, useEffect, useMemo } from 'react'
import { doc, onSnapshot } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TeamHierarchy, TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'
import { FirestoreTeamHierarchyRepository } from '@/lib/infrastructure/firestoreTeamHierarchyRepository'

interface UseTeamHierarchyResult {
  hierarchy: TeamHierarchy | null
  loading: boolean
  error: Error | null
  addTeam: (team: Omit<TeamHierarchyNode, 'children'>) => Promise<void>
  updateTeam: (team: Omit<TeamHierarchyNode, 'children'>) => Promise<void>
  moveTeam: (teamId: string, newParentId: string | null) => Promise<void>
  removeTeam: (teamId: string) => Promise<void>
}

/**
 * Hook for subscribing to and managing team hierarchies
 * @param organisationId The ID of the organisation
 * @returns An object with the hierarchy, loading state, error state, and methods for managing the hierarchy
 */
export function useTeamHierarchy(organisationId: string): UseTeamHierarchyResult {
  const [hierarchy, setHierarchy] = useState<TeamHierarchy | null>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<Error | null>(null)

  const repository = useMemo(() => new FirestoreTeamHierarchyRepository(), [])

  useEffect(() => {
    if (!organisationId) {
      setLoading(false)
      return () => {}
    }

    setLoading(true)
    setError(null)

    const hierarchyRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
    
    const unsubscribe = onSnapshot(
      hierarchyRef,
      async (snapshot) => {
        try {
          if (snapshot.exists()) {
            // Use the repository to handle the conversion from hierarchical to flat structure
            const hierarchyFromRepo = await repository.getByOrganisationId(organisationId)
            if (hierarchyFromRepo) {
              setHierarchy(hierarchyFromRepo)
            } else {
              // Create an empty hierarchy if it doesn't exist
              setHierarchy(TeamHierarchy.create({ teams: {} }))
            }
          } else {
            // Create an empty hierarchy if it doesn't exist
            setHierarchy(TeamHierarchy.create({ teams: {} }))
          }
          setLoading(false)
        } catch (err) {
          console.error('Error parsing team hierarchy:', err)
          setError(err instanceof Error ? err : new Error(String(err)))
          setLoading(false)
        }
      },
      (err) => {
        console.error('Error subscribing to team hierarchy:', err)
        setError(err)
        setLoading(false)
      }
    )

    return () => unsubscribe()
  }, [organisationId, repository])

  const addTeam = async (team: Omit<TeamHierarchyNode, 'children'>): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.addTeam(team)
    await repository.save(organisationId, updatedHierarchy)
  }

  const updateTeam = async (team: Omit<TeamHierarchyNode, 'children'>): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.updateTeam(team)
    await repository.save(organisationId, updatedHierarchy)
  }

  const moveTeam = async (teamId: string, newParentId: string | null): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.moveTeam(teamId, newParentId)
    await repository.save(organisationId, updatedHierarchy)
  }

  const removeTeam = async (teamId: string): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.removeTeam(teamId)
    await repository.save(organisationId, updatedHierarchy)
  }

  return {
    hierarchy,
    loading,
    error,
    addTeam,
    updateTeam,
    moveTeam,
    removeTeam
  }
} 