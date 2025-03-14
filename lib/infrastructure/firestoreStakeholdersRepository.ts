import { StakeholdersRepository, EmailAlreadyExistsError, StakeholderWithRole } from '@/lib/domain/stakeholdersRepository';
import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';
import { db } from '@/lib/firebase';
import { User } from 'firebase/auth';
import { Decision } from '@/lib/domain/Decision';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  where,
  limit,
} from 'firebase/firestore';

/**
 * Single Responsibility:
 * - Implements StakeholdersRepository for Firestore
 * - Translates raw data into domain Stakeholder objects
 */
export class FirestoreStakeholdersRepository implements StakeholdersRepository {
  private collectionPath: string;

  constructor(collectionPath = 'stakeholders') {
    this.collectionPath = collectionPath;
  }

  async updateStakeholderForUser(firebaseUser: User): Promise<void> {
    const stakeholder = await this.getByEmail(firebaseUser.email || '');
    if (stakeholder && stakeholder.photoURL !== firebaseUser.photoURL) {
      await this.update(Stakeholder.create({
        ...stakeholder,
        photoURL: firebaseUser.photoURL || ''
      }));
    }
  }

  async create(props: Omit<StakeholderProps, 'id'>): Promise<Stakeholder> {
    // Check if email already exists
    const existingStakeholder = await this.getByEmail(props.email);
    if (existingStakeholder) {
      throw new EmailAlreadyExistsError(props.email);
    }

    // Create new stakeholder
    const docRef = await addDoc(collection(db, this.collectionPath), {
      email: props.email,
      photoURL: props.photoURL,
    });

    return Stakeholder.create({
      id: docRef.id,
      email: props.email,
      displayName: props.displayName,
      photoURL: props.photoURL,
    });
  }

  async getById(id: string): Promise<Stakeholder | null> {
    const docRef = doc(db, this.collectionPath, id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    return Stakeholder.create({
      id: docSnap.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }

  async getByEmail(email: string): Promise<Stakeholder | null> {
    const q = query(
      collection(db, this.collectionPath),
      where('email', '==', email),
      limit(1)
    );
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      return null;
    }

    const doc = querySnapshot.docs[0];
    const data = doc.data();
    return Stakeholder.create({
      id: doc.id,
      email: data.email,
      displayName: data.displayName,
      photoURL: data.photoURL,
    });
  }

  async update(stakeholder: Stakeholder): Promise<void> {
    // Check if new email already exists for a different stakeholder
    const existingStakeholder = await this.getByEmail(stakeholder.email);
    if (existingStakeholder && existingStakeholder.id !== stakeholder.id) {
      throw new EmailAlreadyExistsError(stakeholder.email);
    }

    const docRef = doc(db, this.collectionPath, stakeholder.id);
    await updateDoc(docRef, {
      displayName: stakeholder.displayName,
      email: stakeholder.email,
      photoURL: stakeholder.photoURL,
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionPath, id);
    await deleteDoc(docRef);
  }

  async getStakeholdersForDecision(decision: Decision): Promise<StakeholderWithRole[]> {
    const stakeholderIds = decision.stakeholders.map(s => s.stakeholder_id);
    const stakeholders = await Promise.all(stakeholderIds.map(id => this.getById(id)));

    return stakeholders
      .map((stakeholder, index) => {
        if (!stakeholder) return null;
        return {
          ...stakeholder,
          role: decision.stakeholders[index].role
        };
      })
      .filter((s): s is StakeholderWithRole => s !== null);
  }

  subscribeToAll(
    onData: (stakeholders: Stakeholder[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const colRef = collection(db, this.collectionPath);
    const q = query(colRef, orderBy('displayName', 'asc'));

    // Subscribe to snapshot updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Convert each doc into a domain Stakeholder
        const stakeholders = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const props: StakeholderProps = {
            id: docSnap.id,
            displayName: data.displayName,
            email: data.email,
            photoURL: data.photoURL,
          };
          return Stakeholder.create(props);
        });
        onData(stakeholders);
      },
      (error) => {
        onError(error);
      }
    );

    return unsubscribe;
  }
}