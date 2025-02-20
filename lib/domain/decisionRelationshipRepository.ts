import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'

export interface DecisionRelationshipRepository {
  subscribeToDecisionRelationships(
    decisionId: string,
    organisationId: string,
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void;

  addRelationship(
    relationship: DecisionRelationship
  ): Promise<string>;

  removeRelationship(relationshipId: string, organisationId: string): Promise<void>;
} 