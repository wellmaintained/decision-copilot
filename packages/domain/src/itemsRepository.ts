// domain/itemsRepository.ts
import { Item } from './Item';

export interface ItemsRepository {
  /**
   * Subscribes to all items in real time.
   * onData: called with a new array of Item domain objects whenever Firestore changes
   * onError: called on any subscription error
   * Returns a function to unsubscribe from the snapshot listener
   */
  subscribeToAll(
    onData: (items: Item[]) => void,
    onError: (error: Error) => void
  ): () => void;

  /**
   * Updates the 'name' of the given Item by ID.
   */
  updateItem(id: string, newName: string): Promise<void>;

  /**
   * Creates a new item with the given name.
   */
  createItem(name: string): Promise<void>;
}