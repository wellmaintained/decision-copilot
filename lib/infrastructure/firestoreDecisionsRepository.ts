import { DecisionsRepository } from '@/lib/domain/decisionsRepository';
import { Decision, DecisionProps, Cost } from '@/lib/domain/Decision';
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
} from 'firebase/firestore';

/**
 * Single Responsibility:
 * - Implements DecisionsRepository for Firestore
 * - Translates raw data into domain Decision objects, and handles updates
 */
export class FirestoreDecisionsRepository implements DecisionsRepository {
  private collectionPath: string;

  constructor(collectionPath = 'decisions') {
    this.collectionPath = collectionPath;
  }

  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const colRef = collection(db, this.collectionPath);
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
            cost: data.cost || 'medium' as Cost,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            criteria: data.criteria || [],
            options: data.options || [],
            decision: data.decision,
            decisionMethod: data.decisionMethod,
            project_id: data.project_id,
            reversibility: data.reversibility || 'hat',
            stakeholders: data.stakeholders || [],
            status: data.status || 'draft',
            updatedAt: data.updatedAt ? (data.updatedAt as Timestamp).toDate() : undefined,
            user: data.user || 'unknown',
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

  async updateDecision(decision: Decision): Promise<void> {
    const docRef = doc(db, this.collectionPath, decision.id);
    await updateDoc(docRef, {
      title: decision.title,
      description: decision.description,
      cost: decision.cost,
      criteria: decision.criteria,
      options: decision.options,
      decision: decision.decision,
      decisionMethod: decision.decisionMethod,
      project_id: decision.project_id,
      reversibility: decision.reversibility,
      stakeholders: decision.stakeholders,
      status: decision.status,
      updatedAt: Timestamp.fromDate(decision.updatedAt || new Date()),
    });
  }

  async createDecision(decision: Decision): Promise<void> {
    const colRef = collection(db, this.collectionPath);
    await addDoc(colRef, {
      title: decision.title,
      description: decision.description,
      cost: decision.cost,
      createdAt: Timestamp.fromDate(decision.createdAt),
      criteria: decision.criteria,
      options: decision.options,
      decision: decision.decision,
      decisionMethod: decision.decisionMethod,
      project_id: decision.project_id,
      reversibility: decision.reversibility,
      stakeholders: decision.stakeholders,
      status: decision.status,
      updatedAt: decision.updatedAt ? Timestamp.fromDate(decision.updatedAt) : null,
      user: decision.user,
    });
  }
} 