import { Firestore, collection, doc, getDoc, setDoc, deleteDoc, query, where, onSnapshot } from 'firebase/firestore'
import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder'
import { StakeholdersRepository, StakeholderWithRole } from '@/lib/domain/stakeholdersRepository'
import { Decision } from '@/lib/domain/Decision'
import { EmailAlreadyExistsError } from '@/lib/domain/stakeholdersRepository'

export class FirebaseStakeholdersRepository implements StakeholdersRepository {
  private readonly stakeholdersCollection
  private readonly organisationId: string

  constructor(private readonly firestore: Firestore, organisationId: string) {
    this.stakeholdersCollection = collection(firestore, 'organisations', organisationId, 'stakeholders')
    this.organisationId = organisationId
  }

  async create(props: Omit<StakeholderProps, 'id'>): Promise<Stakeholder> {
    // Check if stakeholder with email already exists
    const existingStakeholder = await this.getByEmail(props.email)
    if (existingStakeholder) {
      throw new EmailAlreadyExistsError(props.email)
    }

    const stakeholderDoc = doc(this.stakeholdersCollection)
    const stakeholder = Stakeholder.create({
      id: stakeholderDoc.id,
      ...props,
    })

    await setDoc(stakeholderDoc, {
      displayName: stakeholder.displayName,
      email: stakeholder.email,
      photoURL: stakeholder.photoURL,
    })

    return stakeholder
  }

  async getById(id: string): Promise<Stakeholder | null> {
    const stakeholderDoc = await getDoc(doc(this.stakeholdersCollection, id))
    if (!stakeholderDoc.exists()) {
      return null
    }

    return Stakeholder.create({
      id: stakeholderDoc.id,
      ...stakeholderDoc.data() as Omit<StakeholderProps, 'id'>,
    })
  }

  async getByEmail(email: string): Promise<Stakeholder | null> {
    const q = query(this.stakeholdersCollection, where('email', '==', email))
    const snapshot = await new Promise<any>((resolve) => {
      const unsubscribe = onSnapshot(q, (snapshot) => {
        unsubscribe()
        resolve(snapshot)
      })
    })

    if (snapshot.empty) {
      return null
    }

    const doc = snapshot.docs[0]
    return Stakeholder.create({
      id: doc.id,
      ...doc.data() as Omit<StakeholderProps, 'id'>,
    })
  }

  async update(stakeholder: Stakeholder): Promise<void> {
    const stakeholderDoc = doc(this.stakeholdersCollection, stakeholder.id)
    await setDoc(stakeholderDoc, {
      displayName: stakeholder.displayName,
      email: stakeholder.email,
      photoURL: stakeholder.photoURL,
    })
  }

  async delete(id: string): Promise<void> {
    await deleteDoc(doc(this.stakeholdersCollection, id))
  }

  async getStakeholdersForDecision(decision: Decision): Promise<StakeholderWithRole[]> {
    const stakeholderRoles = decision.stakeholderRoles
    const stakeholders = await Promise.all(
      stakeholderRoles.map(async (sr) => {
        const stakeholder = await this.getById(sr.stakeholderId)
        if (!stakeholder) return null
        return {
          ...stakeholder,
          role: sr.role,
        }
      })
    )
    return stakeholders.filter((s): s is StakeholderWithRole => s !== null)
  }

  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void {
    return onSnapshot(
      this.stakeholdersCollection,
      (snapshot) => {
        const stakeholders = snapshot.docs.map((doc) =>
          Stakeholder.create({
            id: doc.id,
            ...doc.data() as Omit<StakeholderProps, 'id'>,
          })
        )
        onData(stakeholders)
      },
      onError
    )
  }
} 