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
} from "firebase/firestore";

/**
 * Single Responsibility:
 * - Implements DecisionsRepository for Firestore
 * - Translates raw data into domain Decision objects, and handles updates
 */
export class FirestoreDecisionsRepository implements DecisionsRepository {
  private getCollectionPath(scope: DecisionScope): string {
    return `organisations/${scope.organisationId}/teams/${scope.teamId}/projects/${scope.projectId}/decisions`;
  }

  private getCollectionRef(scope: DecisionScope) {
    return collection(db, this.getCollectionPath(scope));
  }

  private getDocRef(decisionId: string, scope: DecisionScope) {
    return doc(db, this.getCollectionPath(scope), decisionId);
  }

  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: DecisionScope,
  ): () => void {
    const colRef = this.getCollectionRef(scope);
    const q = query(colRef, orderBy("createdAt", "desc"));

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
            createdAt: data.createdAt
              ? (data.createdAt as Timestamp).toDate()
              : new Date(),
            criteria: data.criteria || [],
            options: data.options || [],
            decision: data.decision,
            decisionMethod: data.decisionMethod,
            reversibility: data.reversibility,
            stakeholders: data.stakeholders || [],
            status: data.status || "draft",
            updatedAt: data.updatedAt
              ? (data.updatedAt as Timestamp).toDate()
              : undefined,
            driverStakeholderId: data.driverStakeholderId,
          };
          return Decision.create(props);
        });
        onData(decisions);
      },
      (error) => {
        onError(error);
      },
    );

    return unsubscribe;
  }

  async updateDecision(
    decision: Decision,
    scope: DecisionScope,
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
      updatedAt: Timestamp.fromDate(new Date()),
      driverStakeholderId: decision.driverStakeholderId,
    });
  }

  async getAll(scope: DecisionScope): Promise<Decision[]> {
    const querySnapshot = await getDocs(this.getCollectionRef(scope));
    return querySnapshot.docs.map((doc) => this.decisionFromFirestore(doc));
  }

  async getById(id: string, scope: DecisionScope): Promise<Decision | null> {
    const docRef = this.getDocRef(id, scope);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    return this.decisionFromFirestore(docSnap);
  }

  private decisionFromFirestore(
    doc: QueryDocumentSnapshot | DocumentSnapshot,
  ): Decision {
    const data = doc.data();
    if (!data) throw new Error(`No data found for decision ${doc.id}`);

    return Decision.create({
      id: doc.id,
      title: data.title,
      description: data.description,
      cost: data.cost,
      createdAt: data.createdAt.toDate(),
      criteria: data.criteria || [],
      options: data.options || [],
      decision: data.decision,
      decisionMethod: data.decisionMethod,
      reversibility: data.reversibility,
      stakeholders: data.stakeholders || [],
      status: data.status,
      updatedAt: data.updatedAt?.toDate(),
      driverStakeholderId: data.driverStakeholderId,
    });
  }

  async create(
    initialData: DecisionProps,
    scope: DecisionScope,
  ): Promise<Decision> {
    const docRef = doc(this.getCollectionRef(scope));
    initialData.updatedAt = Timestamp.fromDate(new Date()).toDate();
    const { id, ...dataWithoutId } = initialData;
    await setDoc(docRef, dataWithoutId);

    return this.decisionFromFirestore(await getDoc(docRef));
  }

  async deleteDecision(
    decisionId: string,
    scope: DecisionScope,
  ): Promise<void> {
    const docRef = this.getDocRef(decisionId, scope);
    await deleteDoc(docRef);
  }

  async delete(id: string, scope: DecisionScope): Promise<void> {
    await deleteDoc(this.getDocRef(id, scope));
  }

  async update(decision: Decision, scope: DecisionScope): Promise<void> {
    const docRef = this.getDocRef(decision.id, scope);
    await setDoc(docRef, {
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
      createdAt: Timestamp.fromDate(decision.createdAt),
      updatedAt: Timestamp.fromDate(new Date()),
      driverStakeholderId: decision.driverStakeholderId || "",
    });
  }
}
