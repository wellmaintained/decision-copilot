import { useState, useEffect } from 'react'
import { StakeholderTeam, StakeholderTeamProps } from '@/lib/domain/StakeholderTeam'
import { FirestoreStakeholderTeamsRepository } from '@/lib/infrastructure/firestoreStakeholderTeamsRepository'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreOrganisationsRepository } from '@/lib/infrastructure/firestoreOrganisationsRepository'

export function useStakeholderTeams() {
  const [stakeholderTeams, setStakeholderTeams] = useState<StakeholderTeam[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return

    const fetchStakeholderTeams = async () => {
      try {
        const stakeholderTeamsRepository = new FirestoreStakeholderTeamsRepository();
        const orgRepository = new FirestoreOrganisationsRepository();
        const stakeholderOrgs = await orgRepository.getForStakeholder(user.uid);
        const teams = await stakeholderTeamsRepository.getByOrganisation(stakeholderOrgs);
        setStakeholderTeams(teams)
      } catch (err) {
        console.error(err)
        setError(err instanceof Error ? err : new Error('Failed to fetch stakeholder teams'))
      } finally {
        setLoading(false)
      }
    }

    fetchStakeholderTeams()
  }, [user?.uid])

  const addStakeholderTeam = async (props: Omit<StakeholderTeamProps, 'id'>) => {
    const repository = new FirestoreStakeholderTeamsRepository()
    const newTeam = await repository.create(props)
    setStakeholderTeams([...stakeholderTeams, newTeam])
  }

  const removeStakeholderTeam = async (stakeholderId: string, teamId: string) => {
    const repository = new FirestoreStakeholderTeamsRepository()
    const existingTeam = await repository.getByStakeholderAndTeam(stakeholderId, teamId)
    if (existingTeam) {
      await repository.delete(existingTeam.id)
      setStakeholderTeams(stakeholderTeams.filter(st => st.id !== existingTeam.id))
    }
  }

  return { stakeholderTeams, setStakeholderTeams, addStakeholderTeam, removeStakeholderTeam, loading, error }
} 