import { Decision, DecisionProps, DecisionRelationship } from "./Decision";

export interface DecisionScope {
  organisationId: string;
}

export interface DecisionsRepository {
  getAll(scope: DecisionScope): Promise<Decision[]>;
  getById(id: string, scope: DecisionScope): Promise<Decision | null>;
  create(
    initialData: Partial<Omit<DecisionProps, "id">>,
    scope: DecisionScope,
  ): Promise<Decision>;
  update(decision: Decision): Promise<void>;
  delete(id: string, scope: DecisionScope): Promise<void>;
  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: DecisionScope,
  ): () => void;
  subscribeToOne(
    decision: Decision,
    onData: (decision: Decision | null) => void,
    onError: (error: Error) => void,
  ): () => void;

  // Updated relationship methods
  addRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void>;

  removeRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void>;

  // New methods for filtering by team and project
  getByTeam(teamId: string, scope: DecisionScope): Promise<Decision[]>;
  getByProject(projectId: string, scope: DecisionScope): Promise<Decision[]>;
}
