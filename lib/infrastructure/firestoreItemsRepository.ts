// infrastructure/firestoreItemsRepository.ts
import { ItemsRepository } from '@/lib/domain/itemsRepository';
import { Item } from '@/lib/domain/Item';
import { Name } from '@/lib/domain/Name';

import { db } from '../firebase'; // your Firebase init
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

  constructor(collectionPath = 'items') {
    this.collectionPath = collectionPath;
  }

  subscribeToAll(
    onData: (items: Item[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const colRef = collection(db, this.collectionPath);
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
    // Validate using Name value object
    const name = Name.create(newName);

    // If no error thrown, proceed to update Firestore
    const docRef = doc(db, this.collectionPath, id);
    await updateDoc(docRef, { name: name.value });
  }

  async createItem(name: string): Promise<void> {
    // Validate using Name value object
    const nameObj = Name.create(name);

    // If no error thrown, proceed to create in Firestore
    const colRef = collection(db, this.collectionPath);
    await addDoc(colRef, { name: nameObj.value });
  }
}