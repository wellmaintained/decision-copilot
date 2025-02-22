import { collection, query, where, onSnapshot, setDoc, deleteDoc, doc, serverTimestamp, QuerySnapshot, DocumentData, getDocs, and, or } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'
import { DecisionRelationshipRepository } from '@/lib/domain/decisionRelationshipRepository'
import { Decision } from '@/lib/domain/Decision'
import { DecisionRelationshipError } from '../domain/DecisionError'

export class FirestoreDecisionRelationshipRepository implements DecisionRelationshipRepository {
  private getCollectionPath(organisationId: string): string {
    return `organisations/${organisationId}/decision_relationships`;
  }

  subscribeToDecisionRelationships(
    decision: Decision,
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const collectionPath = this.getCollectionPath(decision.organisationId);

    const q = query(
      collection(db, collectionPath),
      or(
        where('fromDecisionId', '==', decision.id),
        where('toDecisionId', '==', decision.id)
      )
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot: QuerySnapshot<DocumentData>) => {
        if (snapshot.docChanges().length > 0) {
          const relationships = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as DecisionRelationship));
          onData(relationships);
        }
      },
      onError
    );

    return unsubscribe;
  }

  subscribeToAllRelationships(
    scope: { organisationId: string; teamId: string; projectId: string },
    onData: (relationships: DecisionRelationship[]) => void,
    onError: (error: Error) => void
  ): () => void {
    const collectionPath = this.getCollectionPath(scope.organisationId);
    const q = query(
      collection(db, collectionPath),
      or(
        and(
          where('fromTeamId', '==', scope.teamId),
          where('fromProjectId', '==', scope.projectId)
        ),
        and(
          where('toTeamId', '==', scope.teamId),
          where('toProjectId', '==', scope.projectId)
        )
      )
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

  private async ensureDecisionNotAlreadySuperceded(fromDecisionId: string, organisationId: string): Promise<void> {
    const collectionPath = this.getCollectionPath(organisationId);
    const qFrom = query(
      collection(db, collectionPath),
      where('fromDecisionId', '==', fromDecisionId),
      where('type', '==', 'supersedes')
    );
    const querySnapshot = await getDocs(qFrom);
    if (!querySnapshot.empty) {
      const data = querySnapshot.docs[0].data();
      throw new DecisionRelationshipError(`Decision is already superceeded by toDecisionId:${data.toDecisionId} in organisationid:${data.organisationId}/teamId:${data.toTeamId}/projectId:${data.toProjectId}`); 
    }
  }

  async addRelationship(
    relationship: DecisionRelationship
  ): Promise<string> {
  
    if (relationship.type === "supersedes") {
      await this.ensureDecisionNotAlreadySuperceded(relationship.fromDecisionId, relationship.organisationId);
    }


    await this.checkForCyclicRelationship(
      relationship.fromDecisionId,
      relationship.toDecisionId,
      relationship.organisationId,
      relationship.type
    );

    const collectionPath = this.getCollectionPath(relationship.organisationId);
    const docRef = doc(db, collectionPath, relationship.id);
    await setDoc(docRef, {
      fromDecisionId: relationship.fromDecisionId,
      toDecisionId: relationship.toDecisionId,
      type: relationship.type,
      createdAt: relationship.createdAt,
      fromTeamId: relationship.fromTeamId,
      fromProjectId: relationship.fromProjectId,
      toTeamId: relationship.toTeamId,
      toProjectId: relationship.toProjectId,
      organisationId: relationship.organisationId
    });
    return relationship.id;
  }

  async removeRelationship(
    relationship: DecisionRelationship
  ): Promise<void> {
    const collectionPath = this.getCollectionPath(relationship.organisationId);
    await deleteDoc(doc(db, collectionPath, relationship.id));
  }

  private async checkForCyclicRelationship(
    fromDecisionId: string,
    toDecisionId: string,
    organisationId: string,
    type: DecisionRelationshipType
  ): Promise<boolean> {
    const visited = new Set<string>()
    const stack = new Set<string>()

    const traverse = async (currentId: string): Promise<boolean> => {
      if (stack.has(currentId)) return true // Found cycle
      if (visited.has(currentId)) return false
      
      visited.add(currentId)
      stack.add(currentId)

      // If we reach the fromDecisionId while traversing from toDecisionId, we've found a cycle
      if (currentId === fromDecisionId) {
        throw new DecisionRelationshipError(`Cannot create cyclic ${type === 'supersedes' ? 'supersession' : 'blocking'} relationship`);
      }

      const q = query(
        collection(db, this.getCollectionPath(organisationId)),
        where('fromDecisionId', '==', currentId),
        where('type', '==', type)
      )
      const relationships = await getDocs(q)

      for (const rel of relationships.docs) {
        const data = rel.data()
        if (await traverse(data.toDecisionId)) return true
      }

      stack.delete(currentId)
      return false
    }

    // Start traversal from toDecisionId and see if we can reach fromDecisionId
    return traverse(toDecisionId)
  }
}