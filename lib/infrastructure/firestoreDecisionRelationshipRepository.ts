import { collection, query, where, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, QuerySnapshot, DocumentData } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'
import { DecisionRelationshipRepository } from '@/lib/domain/decisionRelationshipRepository'

export class FirestoreDecisionRelationshipRepository implements DecisionRelationshipRepository {
  private getCollectionPath(organisationId: string): string {
    return `organisations/${organisationId}/decision_relationships`;
  }

  subscribeToDecisionRelationships(
    decisionId: string,
    organisationId: string,
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const collectionPath = this.getCollectionPath(organisationId);
    const q = query(
      collection(db, collectionPath),
      where('fromDecisionId', '==', decisionId)
    );

    return onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        const relationships = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as DecisionRelationship));
        onData(relationships);
      },
      onError
    );
  }

  async addRelationship(
    fromDecisionId: string,
    toDecisionId: string,
    type: 'blocked_by' | 'supersedes',
    organisationId: string
  ): Promise<string> {
    const collectionPath = this.getCollectionPath(organisationId);
    const docRef = await addDoc(collection(db, collectionPath), {
      fromDecisionId,
      toDecisionId,
      type,
      createdAt: serverTimestamp()
    });
    return docRef.id;
  }

  async removeRelationship(relationshipId: string, organisationId: string): Promise<void> {
    const collectionPath = this.getCollectionPath(organisationId);
    await deleteDoc(doc(db, collectionPath, relationshipId));
  }
}

// Export a singleton instance
export const decisionRelationshipRepository = new FirestoreDecisionRelationshipRepository(); 