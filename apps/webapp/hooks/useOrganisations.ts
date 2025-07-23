import { useEffect, useState } from 'react'
import { Organisation, OrganisationProps } from '@decision-copilot/domain/Organisation'
import { useAuth } from '@/hooks/useAuth'
import { organisationsRepository } from '@/lib/repositories'

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user, isAdmin } = useAuth()

  const addOrganisation = async (organisation: OrganisationProps) => {
    const newOrg = await organisationsRepository.create(organisation)
    setOrganisations([...organisations, newOrg])
  }

  const fetchAllOrganisations = async () => {
    if (!isAdmin) {
      throw new Error('Only admin users can fetch all organisations')
    }

    try {
      const allOrgs = await organisationsRepository.getAll()
      setOrganisations(allOrgs)
    } catch (err) {
      console.error(err)
      setError(err instanceof Error ? err : new Error('Failed to fetch all organisations'))
      throw err
    }
  }

  useEffect(() => {
    if (!user?.email) return
    const fetchOrganisation = async () => {
      if (!user?.email) return

      try {
        const stakeholderOrgs = await organisationsRepository.getForStakeholder(user.email)
        setOrganisations(stakeholderOrgs)
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organisations for user: ' + user?.email))
      } finally {
        setLoading(false)
      }
    }

    // createOrganisation()
    fetchOrganisation()
  }, [user?.email])

  return { organisations, setOrganisations, addOrganisation, fetchAllOrganisations, loading, error }
} 
