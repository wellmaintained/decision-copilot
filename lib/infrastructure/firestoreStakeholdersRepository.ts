import { StakeholdersRepository } from '@/lib/domain/stakeholdersRepository';
import { Stakeholder, StakeholderProps } from '@/lib/domain/Stakeholder';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
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