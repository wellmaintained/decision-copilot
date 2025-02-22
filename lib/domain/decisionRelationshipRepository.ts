import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'
import { Decision } from '@/lib/domain/Decision'

export interface DecisionRelationshipRepository {
  subscribeToDecisionRelationships(
    decision: Decision,
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void;

  subscribeToAllRelationships(
    scope: { organisationId: string; teamId: string; projectId: string },
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void;

  addRelationship(
    relationship: DecisionRelationship
  ): Promise<string>;

  removeRelationship(
    relationship: DecisionRelationship
  ): Promise<void>;
} 