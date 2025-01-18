import { StakeholderTeam, StakeholderTeamProps } from '@/lib/domain/StakeholderTeam'
import { StakeholderTeamsRepository } from '@/lib/domain/stakeholderTeamsRepository'
import { db } from '@/lib/firebase'
import { collection, deleteDoc, doc, getDoc, getDocs, query, setDoc, where } from 'firebase/firestore'

export class FirestoreStakeholderTeamsRepository implements StakeholderTeamsRepository {
  private readonly collectionName = 'stakeholderTeams'

  async create(props: Omit<StakeholderTeamProps, 'id'>): Promise<StakeholderTeam> {
    const docRef = doc(collection(db, this.collectionName))
    const stakeholderTeam = StakeholderTeam.create({ ...props, id: docRef.id })
    await setDoc(docRef, {
      stakeholderId: stakeholderTeam.stakeholderId,
      organisationId: stakeholderTeam.organisationId,
      teamId: stakeholderTeam.teamId,
    })
    return stakeholderTeam
  }

  async getById(id: string): Promise<StakeholderTeam | null> {
    const docRef = doc(db, this.collectionName, id)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return StakeholderTeam.create({ id: docSnap.id, ...docSnap.data() } as StakeholderTeamProps)
  }

  async getByStakeholderId(stakeholderId: string): Promise<StakeholderTeam[]> {
    const q = query(
      collection(db, this.collectionName),
      where('stakeholderId', '==', stakeholderId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      StakeholderTeam.create({ id: doc.id, ...doc.data() } as StakeholderTeamProps)
    )
  }

  async getByTeamId(teamId: string): Promise<StakeholderTeam[]> {
    const q = query(
      collection(db, this.collectionName),
      where('teamId', '==', teamId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      StakeholderTeam.create({ id: doc.id, ...doc.data() } as StakeholderTeamProps)
    )
  }

  async getByOrganisationId(organisationId: string): Promise<StakeholderTeam[]> {
    const q = query(
      collection(db, this.collectionName),
      where('organisationId', '==', organisationId)
    )
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => 
      StakeholderTeam.create({ id: doc.id, ...doc.data() } as StakeholderTeamProps)
    )
  }

  async getByOrganisation(organisations: { id: string }[]): Promise<StakeholderTeam[]> {
    const teamsPromises = organisations.map(org => this.getByOrganisationId(org.id));
    const teamsArrays = await Promise.all(teamsPromises);
    return teamsArrays.flat();
  }

  async getByStakeholderAndTeam(stakeholderId: string, teamId: string): Promise<StakeholderTeam | null> {
    const q = query(
      collection(db, this.collectionName),
      where('stakeholderId', '==', stakeholderId),
      where('teamId', '==', teamId)
    )
    const querySnapshot = await getDocs(q)
    if (querySnapshot.empty) return null
    const doc = querySnapshot.docs[0]
    return StakeholderTeam.create({ id: doc.id, ...doc.data() } as StakeholderTeamProps)
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(db, this.collectionName, id))
  }
} 