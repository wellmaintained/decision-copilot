import { useState, useEffect } from 'react'
import { doc, onSnapshot, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { TeamHierarchy, TeamHierarchyNode, TeamHierarchyProps } from '@/lib/domain/TeamHierarchy'

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
      (snapshot) => {
        try {
          if (snapshot.exists()) {
            const data = snapshot.data() as TeamHierarchyProps
            setHierarchy(TeamHierarchy.create(data))
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
  }, [organisationId])

  const saveHierarchy = async (updatedHierarchy: TeamHierarchy): Promise<void> => {
    try {
      const hierarchyRef = doc(db, 'organisations', organisationId, 'teamHierarchies', 'hierarchy')
      await setDoc(hierarchyRef, { teams: updatedHierarchy.teams })
    } catch (err) {
      console.error('Error saving team hierarchy:', err)
      setError(err instanceof Error ? err : new Error(String(err)))
      throw err
    }
  }

  const addTeam = async (team: Omit<TeamHierarchyNode, 'children'>): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.addTeam(team)
    await saveHierarchy(updatedHierarchy)
  }

  const updateTeam = async (team: Omit<TeamHierarchyNode, 'children'>): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.updateTeam(team)
    await saveHierarchy(updatedHierarchy)
  }

  const moveTeam = async (teamId: string, newParentId: string | null): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.moveTeam(teamId, newParentId)
    await saveHierarchy(updatedHierarchy)
  }

  const removeTeam = async (teamId: string): Promise<void> => {
    if (!hierarchy) {
      throw new Error('Hierarchy not loaded')
    }
    
    const updatedHierarchy = hierarchy.removeTeam(teamId)
    await saveHierarchy(updatedHierarchy)
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