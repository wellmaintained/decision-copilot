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
            cost: data.cost,
            createdAt: data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date(),
            criteria: data.criteria || [],
            options: data.options || [],
            decision: data.decision,
            decisionMethod: data.decisionMethod,
            project_id: data.project_id,
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

  async createDecision(): Promise<Decision> {
    const colRef = collection(db, this.collectionPath);
    const docRef = await addDoc(colRef, {
      title: '',
      description: '',
      cost: 'medium',
      criteria: [],
      options: [],
      decision: '',
      decisionMethod: '',
      project_id: '',
      reversibility: 'haircut',
      stakeholders: [],
      status: 'draft',
      createdAt: Timestamp.fromDate(new Date()),
      updatedAt: Timestamp.fromDate(new Date()),
    });
    const docSnap = await getDoc(docRef);
    return Decision.create({
      id: docRef.id,
      title: docSnap.data()?.title,
      description: docSnap.data()?.description,
      cost: docSnap.data()?.cost,
      createdAt: docSnap.data()?.createdAt,
      criteria: docSnap.data()?.criteria,
      options: docSnap.data()?.options,
      decision: docSnap.data()?.decision,
      decisionMethod: docSnap.data()?.decisionMethod,
      project_id: docSnap.data()?.project_id,
      reversibility: docSnap.data()?.reversibility,
      stakeholders: docSnap.data()?.stakeholders,
      status: docSnap.data()?.status,
      updatedAt: docSnap.data()?.updatedAt,
      user: docSnap.data()?.user,
    });
  }

  async deleteDecision(decisionId: string): Promise<void> {
    const docRef = doc(db, this.collectionPath, decisionId);
    await deleteDoc(docRef);
  }
} 