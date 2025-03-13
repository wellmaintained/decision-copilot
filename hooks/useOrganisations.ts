import { useEffect, useState } from 'react'
import { Organisation, OrganisationProps } from '@/lib/domain/Organisation'
import { FirestoreOrganisationsRepository } from '@/lib/infrastructure/firestoreOrganisationsRepository'
import { useAuth } from '@/hooks/useAuth'

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user, isAdmin } = useAuth()

  const addOrganisation = async (organisation: OrganisationProps) => {
    const repository = new FirestoreOrganisationsRepository()
    const newOrg = await repository.create(organisation)
    setOrganisations([...organisations, newOrg])
  }

  const fetchAllOrganisations = async () => {
    if (!isAdmin) {
      throw new Error('Only admin users can fetch all organisations')
    }

    try {
      const repository = new FirestoreOrganisationsRepository()
      const allOrgs = await repository.getAll()
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
        const repository = new FirestoreOrganisationsRepository()
        const stakeholderOrgs = await repository.getForStakeholder(user.email)
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
