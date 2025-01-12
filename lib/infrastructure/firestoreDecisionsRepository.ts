import { DecisionsRepository } from '@/lib/domain/decisionsRepository';
import { Decision, DecisionProps } from '@/lib/domain/Decision';
import { db } from '@/lib/firebase';
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
} from 'firebase/firestore';

/**
 * Single Responsibility:
 * - Implements DecisionsRepository for Firestore
 * - Translates raw data into domain Decision objects, and handles updates
 */
export class FirestoreDecisionsRepository implements DecisionsRepository {
  private getCollectionPath(scope: { organisationId: string; teamId: string; projectId: string }): string {
    return `organisations/${scope.organisationId}/teams/${scope.teamId}/projects/${scope.projectId}/decisions`;
  }

  private getCollectionRef(scope: { organisationId: string; teamId: string; projectId: string }) {
    return collection(db, this.getCollectionPath(scope));
  }

  private getDocRef(decisionId: string, scope: { organisationId: string; teamId: string; projectId: string }) {
    return doc(db, this.getCollectionPath(scope), decisionId);
  }

  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: { organisationId: string; teamId: string; projectId: string }
  ): () => void {
    const colRef = this.getCollectionRef(scope);
    const q = query(colRef, orderBy('createdAt', 'desc'));

    // Subscribe to snapshot updates
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        // Convert each doc into a domain Decision
        const decisions = snapshot.docs.map((docSnap) => {
          const data = docSnap.data();
          const props: DecisionProps = {
            id: docSnap.id,
            title: data.title,
            description: data.description,
            cost: data.cost,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            criteria: data.criteria || [],
            options: data.options || [],
            decision: data.decision,
            decisionMethod: data.decisionMethod,
            reversibility: data.reversibility,
            stakeholders: data.stakeholders || [],
            status: data.status || 'draft',
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            user: data.user,
          };
          return Decision.create(props);
        });
        onData(decisions);
      },
      (error) => {
        onError(error);
      }
    );

    return unsubscribe;
  }

  async updateDecision(
    decision: Decision,
    scope: { organisationId: string; teamId: string; projectId: string }
  ): Promise<void> {
    const docRef = this.getDocRef(decision.id, scope);
    await updateDoc(docRef, {
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
      updatedAt: Timestamp.fromDate(decision.updatedAt || new Date()),
    });
  }

  async createDecision(
    initialData: Partial<Decision>,
    scope: { organisationId: string; teamId: string; projectId: string }
  ): Promise<Decision> {
    const now = new Date();
    const docData = {
      ...initialData,
      createdAt: Timestamp.fromDate(now),
      updatedAt: Timestamp.fromDate(now),
    };

    const colRef = this.getCollectionRef(scope);
    const docRef = await addDoc(colRef, docData);
    const docSnap = await getDoc(docRef);
    const data = docSnap.data()!;

    return Decision.create({
      id: docRef.id,
      title: data.title,
      description: data.description,
      cost: data.cost,
      createdAt: (data.createdAt as Timestamp).toDate(),
      criteria: data.criteria,
      options: data.options,
      decision: data.decision,
      decisionMethod: data.decisionMethod,
      reversibility: data.reversibility,
      stakeholders: data.stakeholders,
      status: data.status,
      updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
      user: data.user,
    });
  }

  async deleteDecision(
    decisionId: string,
    scope: { organisationId: string; teamId: string; projectId: string }
  ): Promise<void> {
    const docRef = this.getDocRef(decisionId, scope);
    await deleteDoc(docRef);
  }
} 