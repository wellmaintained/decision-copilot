import { StakeholdersRepository } from '@/lib/domain/stakeholdersRepository';
import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';
import { db } from '@/lib/firebase';
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

  async create(props: StakeholderProps): Promise<Stakeholder> {
    const colRef = collection(db, this.collectionPath);
    const docRef = await addDoc(colRef, {
      displayName: props.displayName,
      email: props.email,
      photoURL: props.photoURL,
    });
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()!;
    return Stakeholder.create({
      id: docRef.id,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    });
  }

  async update(stakeholder: Stakeholder): Promise<Stakeholder> {
    const docRef = doc(db, this.collectionPath, stakeholder.id);
    await updateDoc(docRef, {
      displayName: stakeholder.displayName,
      email: stakeholder.email,
      photoURL: stakeholder.photoURL,
    });
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()!;
    return Stakeholder.create({
      id: docSnap.id,
      displayName: data.displayName,
      email: data.email,
      photoURL: data.photoURL,
    });
  }

  async delete(id: string): Promise<void> {
    const docRef = doc(db, this.collectionPath, id);
    await deleteDoc(docRef);
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