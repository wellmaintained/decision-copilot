import { useEffect, useState } from 'react'
import { Organisation } from '@/lib/domain/Organisation'
import { db } from '@/lib/firebase'
import { collection, doc, onSnapshot } from 'firebase/firestore'

interface OrganisationState {
  organisation?: Organisation
  loading: boolean
  error?: Error
}

export function useOrganisation() {
  const [state, setState] = useState<OrganisationState>({
    loading: true
  })

  useEffect(() => {
    // For now, we'll just get the first organisation
    // TODO: Add support for multiple organisations
    const unsubscribe = onSnapshot(
      collection(db, 'organisations'),
      (snapshot) => {
        if (snapshot.empty) {
          setState({
            loading: false,
            error: new Error('No organisations found')
          })
          return
        }

        const firstOrg = snapshot.docs[0]
        setState({
          organisation: Organisation.create({
            id: firstOrg.id,
            ...firstOrg.data()
          }),
          loading: false
        })
      },
      (error) => {
        setState({
          loading: false,
          error: error as Error
        })
      }
    )

    return () => unsubscribe()
  }, [])

  return state
} 