import { collection, doc, getDoc, getDocs, addDoc, updateDoc, deleteDoc, query, where } from 'firebase/firestore'
import { db } from '@/lib/infrastructure/firebase'
import { Organization, OrganizationProps } from '@/lib/domain/Organization'
import { OrganizationsRepository } from '@/lib/domain/organizationsRepository'
import { Team } from '@/lib/domain/Team'

export class FirestoreOrganizationsRepository implements OrganizationsRepository {
  async create(props: Omit<OrganizationProps, 'id'>): Promise<Organization> {
    const docRef = await addDoc(collection(db, 'organizations'), {
      name: props.name,
      teams: props.teams.map(team => ({
        id: team.id,
        name: team.name,
        projects: team.projects
      })),
      createdAt: new Date()
    })

    return Organization.create({
      id: docRef.id,
      name: props.name,
      teams: props.teams
    })
  }

  async getById(id: string): Promise<Organization | null> {
    const docRef = doc(db, 'organizations', id)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
      return null
    }

    const data = docSnap.data()
    return Organization.create({
      id: docSnap.id,
      name: data.name,
      teams: data.teams.map((team: any) => Team.create(team))
    })
  }

  async getForStakeholder(stakeholderId: string): Promise<Organization[]> {
    // First get all stakeholderTeams for this stakeholder
    const stakeholderTeamsQuery = query(
      collection(db, 'stakeholderTeams'),
      where('stakeholderId', '==', stakeholderId)
    )
    const stakeholderTeamsSnap = await getDocs(stakeholderTeamsQuery)
    
    // Get unique organization IDs
    const organizationIds = new Set(
      stakeholderTeamsSnap.docs.map(doc => doc.data().organizationId)
    )

    // Fetch each organization
    const organizations = await Promise.all(
      Array.from(organizationIds).map(orgId => this.getById(orgId))
    )

    return organizations.filter((org): org is Organization => org !== null)
  }

  async update(organization: Organization): Promise<void> {
    const docRef = doc(db, 'organizations', organization.id)
    await updateDoc(docRef, {
      name: organization.name,
      teams: organization.teams.map(team => ({
        id: team.id,
        name: team.name,
        projects: team.projects
      }))
    })
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, 'organizations', id)
    await deleteDoc(docRef)
  }
} 