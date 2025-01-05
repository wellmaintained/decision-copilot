// hooks/useItems.ts
import { useEffect, useState } from 'react';
import { FirestoreItemsRepository } from '@/lib/infrastructure/firestoreItemsRepository';
import { Item } from '@/lib/domain/Item';

export function useItems() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // The repository that handles Firestore
  const repository = new FirestoreItemsRepository();

  useEffect(() => {
    const unsubscribe = repository.subscribeToAll(
      (updatedItems) => {
        setItems(updatedItems);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      }
    );

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [repository]);

  async function updateItemName(id: string, newName: string) {
    try {
      await repository.updateItem(id, newName);
    } catch (err) {
      // surface domain errors to the UI
      setError(err as Error);
      throw err;
    }
  }

  async function createItem(name: string) {
    try {
      await repository.createItem(name);
    } catch (err) {
      // surface domain errors to the UI
      setError(err as Error);
      throw err;
    }
  }

  return {
    items,
    loading,
    error,
    updateItemName,
    createItem,
  };
}