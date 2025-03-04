import {
  DecisionsRepository,
  DecisionScope,
} from "@/lib/domain/decisionsRepository";
import { Decision, DecisionProps, DecisionStakeholderRole, DecisionRelationship, DecisionRelationshipTools } from "@/lib/domain/Decision";
import { SupportingMaterial } from '@/lib/domain/SupportingMaterial';
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
  writeBatch,
  query,
  where,
} from "firebase/firestore";
import { DecisionRelationshipError } from "@/lib/domain/DecisionError";

export class FirestoreDecisionsRepository implements DecisionsRepository {

  private getDecisionPath(scope: DecisionScope) {
    return `organisations/${scope.organisationId}/decisions`
  }

  private getDecisionCollectionPathFromDecision(decision: Decision) {
    return `organisations/${decision.organisationId}/decisions`
  }

  private decisionFromFirestore(doc: QueryDocumentSnapshot<DocumentData>): Decision {
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
      createdAt: data.createdAt ? (data.createdAt as unknown as Timestamp).toDate() : new Date(),
      updatedAt: data.updatedAt ? (data.updatedAt as unknown as Timestamp).toDate() : new Date(),
      publishDate: data.publishDate ? (data.publishDate as unknown as Timestamp).toDate() : undefined,
      organisationId: data.organisationId,
      teamIds: data.teamIds || [],
      projectIds: data.projectIds || [],
      relationships: data.relationships || {},
    };
    return Decision.create(props);
  }

  async getAll(scope: DecisionScope): Promise<Decision[]> {
    const q = collection(db, this.getDecisionPath(scope))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => this.decisionFromFirestore(doc))
  }

  async getByTeam(teamId: string, scope: DecisionScope): Promise<Decision[]> {
    const q = query(
      collection(db, this.getDecisionPath(scope)),
      where('teamIds', 'array-contains', teamId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.decisionFromFirestore(doc));
  }

  async getByProject(projectId: string, scope: DecisionScope): Promise<Decision[]> {
    const q = query(
      collection(db, this.getDecisionPath(scope)),
      where('projectIds', 'array-contains', projectId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => this.decisionFromFirestore(doc));
  }

  async getById(id: string, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      throw new Error(`Decision with id ${id} not found`)
    }

    return this.decisionFromFirestore(docSnap)
  }

  async create(initialData: Partial<Omit<DecisionProps, "id">>, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(collection(db, this.getDecisionPath(scope)))
    
    const createData: Record<string, string | string[] | null | FieldValue | Record<string, unknown> | DecisionStakeholderRole[] | SupportingMaterial[]> = {
      title: initialData.title ?? '',
      description: initialData.description ?? '',
      cost: initialData.cost ?? 'low',
      criteria: initialData.criteria ?? [],
      options: initialData.options ?? [],
      decision: initialData.decision ?? null,
      decisionMethod: initialData.decisionMethod ?? null,
      reversibility: initialData.reversibility ?? 'hat',
      stakeholders: initialData.stakeholders ?? [],
      driverStakeholderId: initialData.driverStakeholderId ?? '',
      supportingMaterials: initialData.supportingMaterials ?? [],
      organisationId: scope.organisationId,
      teamIds: initialData.teamIds ?? [],
      projectIds: initialData.projectIds ?? [],
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    }

    // Filter out any undefined values
    const filteredCreateData = Object.fromEntries(
      Object.entries(createData).filter(([, value]) => value !== undefined)
    );

    await setDoc(docRef, filteredCreateData)

    return this.getById(docRef.id, scope)
  }

  async update(decision: Decision): Promise<void> {
    const scope: DecisionScope = {
      organisationId: decision.organisationId,
    };
    
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
      teamIds: decision.teamIds,
      projectIds: decision.projectIds,
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
    const q = collection(db, this.getDecisionPath(scope));
    
    return onSnapshot(
      q,
      (snapshot) => {
        const decisions = snapshot.docs.map(doc => this.decisionFromFirestore(doc));
        onData(decisions);
      },
      onError
    );
  }

  subscribeToOne(
    decision: Decision,
    onData: (decision: Decision | null) => void,
    onError: (error: Error) => void,
  ): () => void {
    const scope: DecisionScope = {
      organisationId: decision.organisationId,
    };
    
    const docRef = doc(db, this.getDecisionPath(scope), decision.id);
    
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const decision = this.decisionFromFirestore(snapshot);
          onData(decision);
        } else {
          onData(null);
        }
      },
      onError
    );
  }

  private async getDecisionFromDecisionRelationship(decisionRelationship: DecisionRelationship): Promise<Decision> {
    const targetDecisionDoc = await getDoc(doc(db, decisionRelationship.targetDecision.path));
    if (!targetDecisionDoc.exists()) {
      throw new DecisionRelationshipError(`Decision relationship target decision ${decisionRelationship.targetDecision} not found`);
    }
    return this.decisionFromFirestore(targetDecisionDoc as QueryDocumentSnapshot<DocumentData>);
  }

  private updateDecisionRelationships(
    batch: ReturnType<typeof writeBatch>,
    decision: Decision,
    relationships: Record<string, unknown> | undefined,
  ): void {
    const decisionRef = doc(db, this.getDecisionCollectionPathFromDecision(decision), decision.id);
    batch.update(decisionRef, {
      relationships: relationships || {},
      updatedAt: serverTimestamp()
    });
  }

  private async applyBidirectionalRelationshipChange(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
    operation: 'add' | 'remove'
  ): Promise<void> {
    // Validate the relationship if we're adding it
    if (operation === 'add') {
      if (sourceDecision.id === targetDecisionRelationship.targetDecision.id) {
        throw new DecisionRelationshipError('A decision cannot have a relationship with itself');
      }

      if (sourceDecision.organisationId !== DecisionRelationshipTools.getTargetDecisionOrganisationId(targetDecisionRelationship)) {
        throw new DecisionRelationshipError('Decisions must belong to the same organisation');
      }
    }

    // Get the target decision
    const targetDecision = await this.getDecisionFromDecisionRelationship(targetDecisionRelationship);
    
    // Get the inverse relationship type
    const inverseType = DecisionRelationshipTools.getInverseRelationshipType(targetDecisionRelationship.type);

    // Create a batch write
    const batch = writeBatch(db);

    // Update source decision relationships
    const updatedSourceDecision = operation === 'add' 
      ? sourceDecision.setRelationship(targetDecisionRelationship.type, targetDecision)
      : sourceDecision.unsetRelationship(targetDecisionRelationship.type, targetDecisionRelationship.targetDecision.id);
    this.updateDecisionRelationships(batch, sourceDecision, updatedSourceDecision.relationships);

    // Update target decision relationships
    const updatedTargetDecision = operation === 'add'
      ? targetDecision.setRelationship(inverseType, sourceDecision)
      : targetDecision.unsetRelationship(inverseType, sourceDecision.id);
    this.updateDecisionRelationships(batch, targetDecision, updatedTargetDecision.relationships);

    // Commit the batch
    await batch.commit();
  }

  async addRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void> {
    await this.applyBidirectionalRelationshipChange(sourceDecision, targetDecisionRelationship, 'add');
  }

  async removeRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void> {
    await this.applyBidirectionalRelationshipChange(sourceDecision, targetDecisionRelationship, 'remove');
  }
}
