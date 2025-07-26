// infrastructure/firestoreItemsRepository.ts
import { ItemsRepository, Item, Name } from '@decision-copilot/domain'
import type { Firestore } from 'firebase/firestore';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc
} from 'firebase/firestore';

/**
 * Single Responsibility:
 * - Implements ItemsRepository for Firestore
 * - Translates raw data into domain Item objects, and handles updates
 */
export class FirestoreItemsRepository implements ItemsRepository {
  private collectionPath: string;

  constructor(private db: Firestore, collectionPath = 'items') {
    this.collectionPath = collectionPath;
  }

  subscribeToAll(
    onData: (items: Item[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const colRef = collection(this.db, this.collectionPath);
    const q = query(colRef, orderBy('name')); // or whatever field

    // Subscribe to snapshot updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Convert each doc into a domain Item
        const items = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          // If doc ID isn't stored in data, use docSnap.id
          const name = Name.create(data.name ?? '');
          return Item.create({ id: docSnap.id, name });
        });
        onData(items);
      },
      (error) => {
        onError(error);
      }
    );

    return unsubscribe;
  }

  async updateItem(id: string, newName: string): Promise<void> {
    // Validate using Name value objec
    const name = Name.create(newName);

    // If no error thrown, proceed to update Firestore
    const docRef = doc(this.db, this.collectionPath, id);
    await updateDoc(docRef, { name: name.value });
  }

  async createItem(name: string): Promise<void> {
    // Validate using Name value objec
    const nameObj = Name.create(name);

    // If no error thrown, proceed to create in Firestore
    const colRef = collection(this.db, this.collectionPath);
    await addDoc(colRef, { name: nameObj.value });
  }
}