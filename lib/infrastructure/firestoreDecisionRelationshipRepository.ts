import { collection, query, where, onSnapshot, setDoc, deleteDoc, doc, serverTimestamp, QuerySnapshot, DocumentData } from 'firebase/firestore'
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
    relationship: DecisionRelationship
  ): Promise<string> {
    const collectionPath = this.getCollectionPath(relationship.organisationId);
    const docRef = doc(db, collectionPath, relationship.id);
    await setDoc(docRef, {
      fromDecisionId: relationship.fromDecisionId,
      toDecisionId: relationship.toDecisionId,
      type: relationship.type,
      createdAt: serverTimestamp(),
      fromTeamId: relationship.fromTeamId,
      fromProjectId: relationship.fromProjectId,
      toTeamId: relationship.toTeamId,
      toProjectId: relationship.toProjectId,
      organisationId: relationship.organisationId
    });
    return relationship.id;
  }

  async removeRelationship(relationshipId: string, organisationId: string): Promise<void> {
    const collectionPath = this.getCollectionPath(organisationId);
    await deleteDoc(doc(db, collectionPath, relationshipId));
  }
}

// Export a singleton instance
export const decisionRelationshipRepository = new FirestoreDecisionRelationshipRepository(); 