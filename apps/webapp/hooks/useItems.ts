// hooks/useItems.ts
import { useEffect, useState } from 'react';
import { Item } from '@decision-copilot/domain/Item';
import { itemsRepository } from '@/lib/repositories';

export function useItems() {
  const [items, setItems] = useState<Item[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribe = itemsRepository.subscribeToAll(
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
  }, []);

  async function updateItemName(id: string, newName: string) {
    try {
      await itemsRepository.updateItem(id, newName);
    } catch (err) {
      // surface domain errors to the UI
      setError(err as Error);
      throw err;
    }
  }

  async function createItem(name: string) {
    try {
      await itemsRepository.createItem(name);
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