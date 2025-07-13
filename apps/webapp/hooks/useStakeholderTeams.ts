import { useState, useEffect } from 'react'
import { StakeholderTeam, StakeholderTeamProps } from '@decision-copilot/domain/StakeholderTeam'
import { FirestoreStakeholderTeamsRepository } from '@decision-copilot/infrastructure'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreOrganisationsRepository } from '@decision-copilot/infrastructure'

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
        const stakeholderTeamsRepository = new FirestoreStakeholderTeamsRepository();
        const orgRepository = new FirestoreOrganisationsRepository();
        const stakeholderOrgs = await orgRepository.getForStakeholder(user.email);
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
    const repository = new FirestoreStakeholderTeamsRepository()
    const newTeam = await repository.create(props)
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
    const repository = new FirestoreStakeholderTeamsRepository()
    const existingTeam = await repository.getByStakeholderAndTeam(stakeholderId, teamId)
    if (existingTeam) {
      await repository.delete(existingTeam.id)
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