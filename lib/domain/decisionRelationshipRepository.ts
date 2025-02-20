import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'

export interface DecisionRelationshipRepository {
  subscribeToDecisionRelationships(
    decisionId: string,
    organisationId: string,
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void;

  addRelationship(
    fromDecisionId: string,
    toDecisionId: string,
    type: 'blocked_by' | 'supersedes',
    organisationId: string
  ): Promise<string>;

  removeRelationship(relationshipId: string, organisationId: string): Promise<void>;
} 