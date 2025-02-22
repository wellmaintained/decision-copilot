import {
  DecisionsRepository,
  DecisionScope,
} from "@/lib/domain/decisionsRepository";
import { Decision, DecisionProps } from "@/lib/domain/Decision";
import { db } from "@/lib/firebase";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  Timestamp,
  deleteDoc,
  getDoc,
  setDoc,
  QueryDocumentSnapshot,
  DocumentSnapshot,
  getDocs,
  where,
  writeBatch,
  documentId,
  serverTimestamp,
} from "firebase/firestore";
import { DecisionRelationship } from "@/lib/domain/DecisionRelationship";
import { FirestoreDecisionRelationshipRepository } from "@/lib/infrastructure/firestoreDecisionRelationshipRepository";

/**
 * Single Responsibility:
 * - Implements DecisionsRepository for Firestore
 * - Translates raw data into domain Decision objects, and handles updates
 */
export class FirestoreDecisionsRepository implements DecisionsRepository {
  private relationshipRepository: FirestoreDecisionRelationshipRepository;

  constructor() {
    this.relationshipRepository = new FirestoreDecisionRelationshipRepository();
  }

  private getDecisionPath(scope: DecisionScope) {
    return `organisations/${scope.organisationId}/teams/${scope.teamId}/projects/${scope.projectId}/decisions`
  }

  private decisionFromFirestore(doc: any, scope: DecisionScope): Decision {
    const data = doc.data()
    return Decision.create({
      ...data,
      id: doc.id,
      createdAt: (data.createdAt as unknown as Timestamp).toDate(),
      updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : undefined,
      organisationId: scope.organisationId,
      teamId: scope.teamId,
      projectId: scope.projectId,
    })
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
    
    const createData: Record<string, any> = {
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
    
    // Create an update object with only defined values
    const updateData: Record<string, any> = {
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
    
    return onSnapshot(
      q,
      (snapshot) => {
        const decisions = snapshot.docs.map(doc => this.decisionFromFirestore(doc, scope))
        onData(decisions)
      },
      onError
    )
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
