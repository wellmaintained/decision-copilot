import { useState, useEffect } from 'react'
import { StakeholderTeam, StakeholderTeamProps } from '@decision-copilot/domain/StakeholderTeam'
import { useAuth } from '@/hooks/useAuth'
import { stakeholderTeamsRepository, organisationsRepository } from '@/lib/repositories'

export function useStakeholderTeams() {
  const [stakeholderTeams, setStakeholderTeams] = useState<StakeholderTeam[]>([])
  const [stakeholderTeamsMap, setStakeholderTeamsMap] = useState<Record<string, string[]>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.email) return

    const fetchStakeholderTeams = async () => {
      try {
        if (!user?.email) {
          throw new Error('User email is required')
        }
        const stakeholderOrgs = await organisationsRepository.getForStakeholder(user.email);
        const teams = await stakeholderTeamsRepository.getByOrganisation(stakeholderOrgs);
        setStakeholderTeams(teams)
        
        // Create a map of stakeholder IDs to team IDs
        const teamsMap: Record<string, string[]> = {};
        teams.forEach(team => {
          if (!teamsMap[team.stakeholderId]) {
            teamsMap[team.stakeholderId] = [];
          }
          teamsMap[team.stakeholderId].push(team.teamId);
        });
        setStakeholderTeamsMap(teamsMap);
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err : new Error('Failed to fetch stakeholder teams'))
      } finally {
        setLoading(false)
      }
    }

    fetchStakeholderTeams()
  }, [user?.email])

  const addStakeholderTeam = async (props: Omit<StakeholderTeamProps, 'id'>) => {
    const newTeam = await stakeholderTeamsRepository.create(props)
    setStakeholderTeams([...stakeholderTeams, newTeam])
    setStakeholderTeamsMap(prev => {
      const newMap = { ...prev };
      if (!newMap[newTeam.stakeholderId]) {
        newMap[newTeam.stakeholderId] = [];
      }
      newMap[newTeam.stakeholderId].push(newTeam.teamId);
      return newMap;
    });
  }

  const removeStakeholderTeam = async (stakeholderId: string, teamId: string) => {
    const existingTeam = await stakeholderTeamsRepository.getByStakeholderAndTeam(stakeholderId, teamId)
    if (existingTeam) {
      await stakeholderTeamsRepository.delete(existingTeam.id)
      setStakeholderTeams(stakeholderTeams.filter(st => st.id !== existingTeam.id))
      setStakeholderTeamsMap(prev => {
        const newMap = { ...prev };
        if (newMap[stakeholderId]) {
          newMap[stakeholderId] = newMap[stakeholderId].filter(id => id !== teamId);
          if (newMap[stakeholderId].length === 0) {
            delete newMap[stakeholderId];
          }
        }
        return newMap;
      });
    }
  }

  return { stakeholderTeams, stakeholderTeamsMap, loading, error, addStakeholderTeam, removeStakeholderTeam }
} 