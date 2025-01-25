import { Decision, DecisionProps } from "./Decision";

export interface DecisionScope {
  organisationId: string;
  teamId: string;
  projectId: string;
}

export interface DecisionsRepository {
  getAll(scope: DecisionScope): Promise<Decision[]>;
  getById(id: string, scope: DecisionScope): Promise<Decision | null>;
  create(
    initialData: Partial<Omit<DecisionProps, "id">>,
    scope: DecisionScope,
  ): Promise<Decision>;
  update(decision: Decision, scope: DecisionScope): Promise<void>;
  delete(id: string, scope: DecisionScope): Promise<void>;
  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: DecisionScope,
  ): () => void;
  subscribeToOne(
    id: string,
    onData: (decision: Decision | null) => void,
    onError: (error: Error) => void,
    scope: DecisionScope,
  ): () => void;
}
