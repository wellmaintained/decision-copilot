import { useEffect, useState } from 'react'
import { Organisation } from '@/lib/domain/Organisation'
import { FirestoreOrganisationsRepository } from '@/lib/infrastructure/firestoreOrganisationsRepository'
import { useAuth } from '@/hooks/useAuth'
import { FirestoreStakeholderTeamsRepository } from '@/lib/infrastructure/firestoreStakeholderTeamsRepository'
import { Project } from '@/lib/domain/Project'
import { Decision } from '@/lib/domain/Decision'
import { Team } from '@/lib/domain/Team'

export function useOrganisation() {
  const [organisation, setOrganisation] = useState<Organisation | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    if (!user?.uid) return
    const createOrganisation = async () => {
        const stakeholderTeamRepo = new FirestoreStakeholderTeamsRepository();
        const stakeholderTeam = await stakeholderTeamRepo.create({
          stakeholderId: user.uid,
          teamId: '3y0NDXZwX9DhmSQVOXag',
          organisationId: 'DwMAq28CCDKgTIWmkYGR'
        })
        console.log(stakeholderTeam);

        const org = Organisation.create({
          id: 'new',
          name: 'Mechanical Orchard',
          teams: [
            Team.create({
              id: 'new',
              name: 'MO Leadership',
              organisationId: 'new',
              projects: [
                Project.create({
                  id: 'new',
                  name: 'MOMP (MO Modernisation Platform)',
                  description: 'MOMP is a platform that allows us to modernise our infrastructure',
                  teamId: 'new',
                  decisions: [Decision.create({
                  id: 'new',
                  title: 'Which zero access network technology should we use?',
                  description: 'eg: Teleport',
                  cost: "low",
                  createdAt: new Date(),
                  criteria: [],
                  options: [],
                  decision: '',
                  decisionMethod: '',
                  reversibility: 'hat',
                  stakeholders: [],
                  status: 'draft',
                  user: 'new',
                })]
              })
            ]
          }),
          Team.create({
            id: 'new',
            name: 'Infra',
            organisationId: 'new',
            projects: [
              Project.create({
                id: 'new',
                name: 'MOMP Environment',
                description: 'The environment that runs the modernisation tooling inside the customer\'s network',
                teamId: 'new',
                decisions: [Decision.create({
                  id: 'new',
                  title: 'Teleport architecture',
                  description: 'Description 1',
                  cost: "low",
                  createdAt: new Date(),
                  criteria: [],
                  options: [],
                  decision: '',
                  decisionMethod: '',
                  reversibility: 'hat',
                  stakeholders: [],
                  status: 'draft',
                  user: 'new',
                })]
              })
            ]
          }),
        ]
      })

      const repository = new FirestoreOrganisationsRepository()
      const org2 = await repository.create(org);
      console.log(org2);
    }
    const fetchOrganisation = async () => {
      if (!user?.uid) return

      try {
        const repository = new FirestoreOrganisationsRepository()
        const stakeholderOrgs = await repository.getForStakeholder(user.uid)
        console.log("current users' stakeholderOrgs", stakeholderOrgs)

        // TODO figure out how to let the user select an organisation
        const selectedOrg = stakeholderOrgs[0]
        setOrganisation(selectedOrg)

      } catch (err) {
        console.error(err);
        setError(err instanceof Error ? err : new Error('Failed to fetch organisation'))
      } finally {
        setLoading(false)
      }
    }

    // createOrganisation()
    fetchOrganisation()
  }, [user?.uid])

  return { organisation, loading, error }
} 