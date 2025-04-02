import { useState, useEffect } from 'react'
import { TeamHierarchy, TeamHierarchyNode } from '@/lib/domain/TeamHierarchy'

interface UseTeamHierarchyResult {
  hierarchy: TeamHierarchy | null
  loading: boolean
  error: Error | null
  addTeam: (team: TeamHierarchyNode) => Promise<void>
  removeTeam: (teamId: string) => Promise<void>
  updateTeam: (teamId: string, team: TeamHierarchyNode) => Promise<void>
}

/**
 * Hook for subscribing to and managing team hierarchies
 * @param organisationId The ID of the organisation
 * @returns An object with the hierarchy, loading state, error state, and methods for managing the hierarchy
 */
export function useTeamHierarchy(organisationId: string): UseTeamHierarchyResult {
  const [hierarchy, setHierarchy] = useState<TeamHierarchy | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    async function fetchHierarchy() {
      try {
        const response = await fetch(`/api/admin/organisations/${organisationId}/team-hierarchy`)
        if (!response.ok) throw new Error('Failed to fetch team hierarchy')
        const data = await response.json()
        setHierarchy(data)
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Unknown error'))
      } finally {
        setLoading(false)
      }
    }

    fetchHierarchy()
  }, [organisationId])

  const addTeam = async (team: TeamHierarchyNode) => {
    try {
      const response = await fetch(`/api/admin/organisations/${organisationId}/team-hierarchy/teams`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(team)
      })
      
      if (!response.ok) throw new Error('Failed to add team')
      
      const updatedHierarchy = await response.json()
      setHierarchy(updatedHierarchy)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to add team'))
      throw err
    }
  }

  const removeTeam = async (teamId: string) => {
    try {
      const response = await fetch(
        `/api/admin/organisations/${organisationId}/team-hierarchy/teams/${teamId}`,
        { method: 'DELETE' }
      )
      
      if (!response.ok) throw new Error('Failed to remove team')
      
      const updatedHierarchy = await response.json()
      setHierarchy(updatedHierarchy)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to remove team'))
      throw err
    }
  }

  const updateTeam = async (teamId: string, team: TeamHierarchyNode) => {
    try {
      const response = await fetch(
        `/api/admin/organisations/${organisationId}/team-hierarchy/teams/${teamId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(team)
        }
      )
      
      if (!response.ok) throw new Error('Failed to update team')
      
      const updatedHierarchy = await response.json()
      setHierarchy(updatedHierarchy)
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to update team'))
      throw err
    }
  }

  return {
    hierarchy,
    loading,
    error,
    addTeam,
    removeTeam,
    updateTeam
  }
} 