import { useEffect, useState } from 'react'
import { Organisation } from '@/lib/domain/Organisation'
import { FirestoreOrganisationsRepository } from '@/lib/infrastructure/firestoreOrganisationsRepository'
import { useAuth } from '@/hooks/useAuth'
// import { Team } from '@/lib/domain/Team'
// import { Project } from '@/lib/domain/Project'
// import { Decision } from '@/lib/domain/Decision'

export function useOrganisations() {
  const [organisations, setOrganisations] = useState<Organisation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchOrganisations = async () => {
      if (!user?.uid) return

      try {
        const repository = new FirestoreOrganisationsRepository()

          // const org = Organisation.create({
          //   id: 'new',
          //   name: 'Mechanical Orchard',
          //   teams: [
          //     Team.create({
          //       id: 'new',
          //       name: 'MO Leadership',
          //       organizationId: 'new',
          //       projects: [
          //         Project.create({
          //           id: 'new',
          //           name: 'MOMP (MO Modernisation Platform)',
          //           description: 'MOMP is a platform that allows us to modernise our infrastructure',
          //           teamId: 'new',
          //           decisions: [Decision.create({
          //             id: 'new',
          //             title: 'Which zero access network technology should we use?',
          //             description: 'eg: Teleport',
          //             cost: "low",
          //             createdAt: new Date(),
          //             criteria: [],
          //             options: [],
          //             decision: '',
          //             decisionMethod: '',
          //             reversibility: 'hat',
          //             stakeholders: [],
          //             status: 'draft',
          //             user: 'new',
          //           })]
          //         })
          //       ]
          //     }),
          //     Team.create({
          //       id: 'new',
          //       name: 'Infra',
          //       organizationId: 'new',
          //       projects: [
          //         Project.create({
          //           id: 'new',
          //           name: 'MOMP Environment',
          //           description: 'The environment that runs the modernisation tooling inside the customer\'s network',
          //           teamId: 'new',
          //           decisions: [Decision.create({
          //             id: 'new',
          //             title: 'Teleport architecture',
          //             description: 'Description 1',
          //             cost: "low",
          //             createdAt: new Date(),
          //             criteria: [],
          //             options: [],
          //             decision: '',
          //             decisionMethod: '',
          //             reversibility: 'hat',
          //             stakeholders: [],
          //             status: 'draft',
          //             user: 'new',
          //           })]
          //         })
          //       ]
          //     }),
          //   ]
          // })

          // const org2 = await repository.create(org);
          // console.log(org2);
        const orgs = await repository.getForStakeholder(user.uid)
        setOrganisations(orgs)
      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organisations'))
      } finally {
        setLoading(false)
      }
    }

    fetchOrganisations()
  }, [user?.uid])

  return { organisations, loading, error }
} 