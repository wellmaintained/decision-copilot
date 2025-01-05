import { Decision} from '@/lib/domain/Decision';

export interface DecisionsRepository {
  /**
   * Subscribes to all decisions in real time.
   * onData: called with a new array of Decision domain objects whenever Firestore changes
   * onError: called on any subscription error
   * Returns a function to unsubscribe from the snapshot listener
   */
  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void
  ): () => void;

  /**
   * Updates a decision.
   */
  updateDecision(decision: Decision): Promise<void>;

  /**
   * Creates a new decision.
   */
  createDecision(): Promise<Decision>;

  /**
   * Deletes a decision.
   */
  deleteDecision(decisionId: string): Promise<void>;
} 