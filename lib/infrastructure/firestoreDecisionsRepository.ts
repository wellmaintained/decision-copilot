import {
  DecisionsRepository,
  DecisionScope,
} from "@/lib/domain/decisionsRepository";
import { Decision, DecisionProps } from "@/lib/domain/Decision";
import { db } from "@/lib/firebase";
import {
  collection,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  deleteDoc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp,
  DocumentData,
  QueryDocumentSnapshot,
  FieldValue,
} from "firebase/firestore";
import { DecisionRelationship } from "@/lib/domain/DecisionRelationship";
import { FirestoreDecisionRelationshipRepository } from "@/lib/infrastructure/firestoreDecisionRelationshipRepository";

export class FirestoreDecisionsRepository implements DecisionsRepository {
  private relationshipRepository: FirestoreDecisionRelationshipRepository;

  constructor() {
    this.relationshipRepository = new FirestoreDecisionRelationshipRepository();
  }

  private getDecisionPath(scope: DecisionScope) {
    return `organisations/${scope.organisationId}/teams/${scope.teamId}/projects/${scope.projectId}/decisions`
  }

  private decisionFromFirestore(doc: QueryDocumentSnapshot<DocumentData>, scope: DecisionScope): Decision {
    const data = doc.data();
    const props: DecisionProps = {
      id: doc.id,
      title: data.title || '',
      description: data.description || '',
      cost: data.cost || 'low',
      criteria: data.criteria || [],
      options: data.options || [],
      decision: data.decision,
      decisionMethod: data.decisionMethod,
      reversibility: data.reversibility || 'haircut',
      stakeholders: data.stakeholders || [],
      driverStakeholderId: data.driverStakeholderId || '',
      supportingMaterials: data.supportingMaterials || [],
      createdAt: (data.createdAt as unknown as Timestamp).toDate(),
      updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : undefined,
      publishDate: data.publishDate ? (data.publishDate as unknown as Timestamp).toDate() : undefined,
      organisationId: scope.organisationId,
      teamId: scope.teamId,
      projectId: scope.projectId,
      relationships: data.relationships || [],
    };
    return Decision.create(props);
  }

  async getAll(scope: DecisionScope): Promise<Decision[]> {
    const q = collection(db, this.getDecisionPath(scope))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => this.decisionFromFirestore(doc, scope))
  }

  async getById(id: string, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error(`Decision with id ${id} not found`)
    }

    return this.decisionFromFirestore(docSnap, scope)
  }

  async create(initialData: Partial<Omit<DecisionProps, "id">>, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(collection(db, this.getDecisionPath(scope)))
    
    const createData: Record<string, FieldValue | Partial<unknown> | undefined> = {
      title: initialData.title,
      description: initialData.description,
      cost: initialData.cost,
      criteria: initialData.criteria,
      options: initialData.options,
      decision: initialData.decision,
      decisionMethod: initialData.decisionMethod,
      reversibility: initialData.reversibility,
      stakeholders: initialData.stakeholders,
      driverStakeholderId: initialData.driverStakeholderId,
      supportingMaterials: initialData.supportingMaterials,
      organisationId: scope.organisationId,
      teamId: scope.teamId,
      projectId: scope.projectId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    }

    await setDoc(docRef, createData)

    return this.getById(docRef.id, scope)
  }

  async update(decision: Decision, scope: DecisionScope): Promise<void> {
    const docRef = doc(db, this.getDecisionPath(scope), decision.id)
    
    const updateData: Record<string, FieldValue | Partial<unknown> | undefined> = {
      title: decision.title,
      description: decision.description,
      cost: decision.cost,
      criteria: decision.criteria,
      options: decision.options,
      decision: decision.decision,
      decisionMethod: decision.decisionMethod,
      reversibility: decision.reversibility,
      stakeholders: decision.stakeholders,
      status: decision.status,
      driverStakeholderId: decision.driverStakeholderId,
      supportingMaterials: decision.supportingMaterials,
      organisationId: decision.organisationId,
      teamId: decision.teamId,
      projectId: decision.projectId,
      updatedAt: serverTimestamp()
    }
    
    await updateDoc(docRef, updateData)
  }

  async delete(id: string, scope: DecisionScope): Promise<void> {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    await deleteDoc(docRef)
  }

  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: DecisionScope
  ): () => void {
    const q = collection(db, this.getDecisionPath(scope))
    let currentDecisions: Map<string, Decision> = new Map();
    let relationshipsByDecisionId: Map<string, DecisionRelationship[]> = new Map();
    
    // Helper to emit the current state
    const emitCurrentState = () => {
      const decisions = Array.from(currentDecisions.values()).map(decision => 
        decision.with({ relationships: relationshipsByDecisionId.get(decision.id) || [] })
      );
      onData(decisions);
    };

    // Subscribe to all decisions
    const decisionsUnsubscribe = onSnapshot(
      q,
      (snapshot) => {
        currentDecisions = new Map(
          snapshot.docs.map(doc => {
            const decision = this.decisionFromFirestore(doc, scope);
            return [decision.id, decision];
          })
        );
        emitCurrentState();
      },
      onError
    );

    // Subscribe to all relationships for these decisions
    const relationshipsUnsubscribe = this.relationshipRepository.subscribeToAllRelationships(
      scope,
      (relationships) => {
        // Group relationships by decision ID
        relationshipsByDecisionId = new Map();
        for (const relationship of relationships) {
          // Add to fromDecision's relationships
          const fromRelationships = relationshipsByDecisionId.get(relationship.fromDecisionId) || [];
          fromRelationships.push(relationship);
          relationshipsByDecisionId.set(relationship.fromDecisionId, fromRelationships);

          // Add to toDecision's relationships
          const toRelationships = relationshipsByDecisionId.get(relationship.toDecisionId) || [];
          toRelationships.push(relationship);
          relationshipsByDecisionId.set(relationship.toDecisionId, toRelationships);
        }
        emitCurrentState();
      },
      onError
    );

    // Return a function that unsubscribes from both
    return () => {
      decisionsUnsubscribe();
      relationshipsUnsubscribe();
    };
  }

  subscribeToOne(
    id: string,
    onData: (decision: Decision) => void,
    onError: (error: Error) => void,
    scope: DecisionScope
  ): () => void {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    let currentDecision: Decision | null = null;
    let currentRelationships: DecisionRelationship[] = [];
    
    // Helper to emit the current state
    const emitCurrentState = () => {
      if (currentDecision) {
        onData(currentDecision.with({ relationships: currentRelationships }));
      }
    };

    // Subscribe to the decision document
    const decisionUnsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          currentDecision = this.decisionFromFirestore(snapshot, scope);
          emitCurrentState();
        }
      },
      onError
    );

    // Subscribe to relationship changes
    const relationshipsUnsubscribe = this.relationshipRepository.subscribeToDecisionRelationships(
      // Create a minimal Decision object just for the subscription
      Decision.create({
        id,
        organisationId: scope.organisationId,
        teamId: scope.teamId,
        projectId: scope.projectId,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any), // Using 'as any' since we don't need all Decision props just for the relationship subscription
      (relationships) => {
        currentRelationships = relationships;
        emitCurrentState();
      },
      onError
    );

    // Return a function that unsubscribes from both
    return () => {
      decisionUnsubscribe();
      relationshipsUnsubscribe();
    };
  }
}
