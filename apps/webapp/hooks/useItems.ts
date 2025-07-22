import { db } from "@/lib/env";
// hooks/useItems.ts
import { useEffect, useState } from 'react';
import { FirestoreItemsRepository } from '@decision-copilot/infrastructure'
import { Item } from '@decision-copilot/domain/Item';

export function useItems() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // The repository that handles Firestore
  const repository = new FirestoreItemsRepository(db);

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