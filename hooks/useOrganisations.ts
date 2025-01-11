import { useEffect, useState } from 'react'
import { Organisation } from '@/lib/domain/Organisation'
import { FirestoreOrganisationsRepository } from '@/lib/infrastructure/firestoreOrganisationsRepository'
import { useAuth } from '@/hooks/useAuth'

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return
    const fetchOrganisation = async () => {
      if (!user?.uid) return

      try {
        const repository = new FirestoreOrganisationsRepository()
        const stakeholderOrgs = await repository.getForStakeholder(user.uid)
        console.log("current users' stakeholderOrgs", stakeholderOrgs)

        setOrganisations(stakeholderOrgs)

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organisations for user: ' + user?.uid))
      } finally {
        setLoading(false)
      }
    }

    // createOrganisation()
    fetchOrganisation()
  }, [user?.uid])

  return { organisations, loading, error }
} 
