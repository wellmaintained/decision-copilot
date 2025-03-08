import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Organisation, OrganisationProps } from '@/lib/domain/Organisation'
import { OrganisationsRepository } from '@/lib/domain/organisationsRepository'
import { Team } from '@/lib/domain/Team'
import { Project } from '@/lib/domain/Project'
import { FirestoreStakeholdersRepository } from '@/lib/infrastructure/firestoreStakeholdersRepository'

export class FirestoreOrganisationsRepository implements OrganisationsRepository {
  private stakeholdersRepository: FirestoreStakeholdersRepository

  constructor() {
    this.stakeholdersRepository = new FirestoreStakeholdersRepository()
  }

  async create(props: Omit<OrganisationProps, 'id'>): Promise<Organisation> {
    // Create the main organisation document
    const orgDoc = await addDoc(collection(db, 'organisations'), {
      name: props.name,
      createdAt: new Date()
    })

    const organisation = {
      id: orgDoc.id,
      name: props.name
    }

    // Add teams and their projects to subcollections
    const teamsWithIds = await Promise.all(props.teams.map(async team => {
      const teamDoc = await addDoc(collection(db, 'organisations', orgDoc.id, 'teams'), {
        name: team.name
      })

      // Add projects to a subcollection within the team
      const projectsWithIds = await Promise.all(team.projects.map(async project => {
        const projectDoc = await addDoc(collection(db, 'organisations', orgDoc.id, 'teams', teamDoc.id, 'projects'), {
          name: project.name,
          description: project.description,
          organisationId: orgDoc.id
        })

        return Project.create({
          id: projectDoc.id,
          name: project.name,
          description: project.description,
          organisationId: orgDoc.id
        })
      }))

      return Team.create({
        id: teamDoc.id,
        name: team.name,
        organisation,
        projects: projectsWithIds
      })
    }))

    return Organisation.create({
      id: orgDoc.id,
      name: props.name,
      teams: teamsWithIds
    })
  }

  async getById(id: string): Promise<Organisation> {
    const docRef = doc(db, 'organisations', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      throw new Error('Organisation not found')
    }

    const data = docSnap.data()
    const organisation = {
      id: docSnap.id,
      name: data.name
    }

    // Get teams from subcollection
    const teamsSnap = await getDocs(collection(db, 'organisations', id, 'teams'))
    const teams = await Promise.all(teamsSnap.docs.map(async teamDoc => {
      // Get projects from subcollection within team
      const projectsSnap = await getDocs(collection(db, 'organisations', id, 'teams', teamDoc.id, 'projects'))
      const projects = await Promise.all(projectsSnap.docs.map(async projectDoc => {
        const projectData = projectDoc.data()
        return Project.create({
          id: projectDoc.id,
          name: projectData.name,
          description: projectData.description,
          organisationId: id
        })
      }))

      return Team.create({
        id: teamDoc.id,
        name: teamDoc.data().name,
        organisation,
        projects: projects
      })
    }))

    // Update the organisation with teams
    return Organisation.create({
      id: docSnap.id,
      name: data.name,
      teams: teams
    })
  }

  async getForStakeholder(stakeholderEmail: string): Promise<Organisation[]> {
    // First lookup the stakeholder by email
    const stakeholder = await this.stakeholdersRepository.getByEmail(stakeholderEmail)
    
    if (!stakeholder) {
      throw new Error('Stakeholder with email <<' + stakeholderEmail + '>> not found')
    }

    // Then get all stakeholderTeams for this stakeholder
    const stakeholderTeamsQuery = query(
      collection(db, 'stakeholderTeams'),
      where('stakeholderId', '==', stakeholder.id)
    )
    const stakeholderTeamsSnap = await getDocs(stakeholderTeamsQuery)
    
    // Get unique organisation IDs
    const organisationIds = new Set(
      stakeholderTeamsSnap.docs.map(doc => doc.data().organisationId)
    )

    // Fetch each organisation
    const organisations = await Promise.all(
      Array.from(organisationIds).map(orgId => this.getById(orgId))
    )

    return organisations.filter((org): org is Organisation => org !== null)
  }

  async update(organisation: Organisation): Promise<void> {
    const docRef = doc(db, 'organisations', organisation.id)
    await updateDoc(docRef, {
      name: organisation.name
    })

    // Update teams subcollection
    for (const team of organisation.teams) {
      const teamRef = doc(db, 'organisations', organisation.id, 'teams', team.id)
      await updateDoc(teamRef, {
        name: team.name
      })

      // Update projects subcollection within team
      for (const project of team.projects) {
        const projectRef = doc(db, 'organisations', organisation.id, 'teams', team.id, 'projects', project.id)
        await updateDoc(projectRef, {
          name: project.name,
          description: project.description
        })
      }
    }
  }

  async delete(id: string): Promise<void> {
    // Delete all decisions in all projects in all teams
    const teamsSnap = await getDocs(collection(db, 'organisations', id, 'teams'))
    for (const teamDoc of teamsSnap.docs) {
      const projectsSnap = await getDocs(collection(db, 'organisations', id, 'teams', teamDoc.id, 'projects'))
      for (const projectDoc of projectsSnap.docs) {
        const decisionsSnap = await getDocs(
          collection(db, 'organisations', id, 'teams', teamDoc.id, 'projects', projectDoc.id, 'decisions')
        )
        for (const decisionDoc of decisionsSnap.docs) {
          await deleteDoc(decisionDoc.ref)
        }
        await deleteDoc(projectDoc.ref)
      }
      await deleteDoc(teamDoc.ref)
    }

    // Delete the organisation document
    const docRef = doc(db, 'organisations', id)
    await deleteDoc(docRef)
  }
} 