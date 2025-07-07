// domain/Item.ts
import { Name } from './Name';

export interface ItemProps {
  id: string;
  name: Name;
}

/**
 * Single Responsibility:
 * - Domain entity for an Item
 */
export class Item {
  private constructor(
    public readonly id: string,
    public name: Name
  ) {}

  static create(props: ItemProps): Item {
    if (!props.id) {
      throw new Error("Item must have an ID.");
    }
    // 'props.name' is already validated by Name.create(...)
    return new Item(props.id, props.name);
  }

  updateName(newName: Name) {
    this.name = newName;
  }
}