import {
  DecisionsRepository,
  DecisionScope,
  Decision,
  DecisionProps,
  DecisionStakeholderRole,
  DecisionRelationship,
  DecisionRelationshipTools,
  SupportingMaterial,
  DecisionRelationshipError,
} from "@decision-copilot/domain";
import type { Firestore } from "firebase/firestore";
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
// Removed duplicate import - already imported above

export class FirestoreDecisionsRepository implements DecisionsRepository {
  constructor(private db: Firestore) {}

  private getDecisionPath(scope: DecisionScope) {
    if (!scope.organisationId) {
      throw new Error("Cannot get decision path: organisationId is required");
    }
    return `organisations/${scope.organisationId}/decisions`;
  }

  private getDecisionCollectionPathFromDecision(decision: Decision): string {
    return `organisations/${decision.organisationId}/decisions`;
  }

  private decisionFromFirestore(
    doc: QueryDocumentSnapshot<DocumentData>,
  ): Decision {
    const data = doc.data();
    const props: DecisionProps = {
      id: doc.id,
      title: data.title || "",
      description: data.description || "",
      cost: data.cost || "low",
      decision: data.decision,
      decisionMethod: data.decisionMethod,
      reversibility: data.reversibility || "haircut",
      stakeholders: data.stakeholders || [],
      driverStakeholderId: data.driverStakeholderId || "",
      supportingMaterials: data.supportingMaterials || [],
      createdAt: data.createdAt
        ? (data.createdAt as unknown as Timestamp).toDate()
        : new Date(),
      updatedAt: data.updatedAt
        ? (data.updatedAt as unknown as Timestamp).toDate()
        : new Date(),
      publishDate: data.publishDate
        ? (data.publishDate as unknown as Timestamp).toDate()
        : undefined,
      organisationId: data.organisationId,
      teamIds: data.teamIds || [],
      projectIds: data.projectIds || [],
      relationships: data.relationships || {},
      decisionNotes: data.decisionNotes || "",
    };
    return Decision.create(props);
  }

  async getAll(scope: DecisionScope): Promise<Decision[]> {
    const q = collection(this.db, this.getDecisionPath(scope));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.decisionFromFirestore(doc));
  }

  async getByTeam(teamId: string, scope: DecisionScope): Promise<Decision[]> {
    const q = query(
      collection(this.db, this.getDecisionPath(scope)),
      where("teamIds", "array-contains", teamId),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.decisionFromFirestore(doc));
  }

  async getByProject(
    projectId: string,
    scope: DecisionScope,
  ): Promise<Decision[]> {
    const q = query(
      collection(this.db, this.getDecisionPath(scope)),
      where("projectIds", "array-contains", projectId),
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map((doc) => this.decisionFromFirestore(doc));
  }

  async getById(id: string, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(this.db, this.getDecisionPath(scope), id);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      throw new Error(`Decision with id ${id} not found`);
    }

    return this.decisionFromFirestore(docSnap);
  }

  async create(
    initialData: Partial<DecisionProps> = {},
    scope: DecisionScope,
  ): Promise<Decision> {
    const docRef = doc(collection(this.db, this.getDecisionPath(scope)));

    const data: Record<
      string,
      | string
      | string[]
      | null
      | FieldValue
      | Record<string, unknown>
      | DecisionStakeholderRole[]
      | SupportingMaterial[]
    > = {
      title: initialData.title ?? "",
      description: initialData.description ?? "",
      cost: initialData.cost ?? "low",
      decision: initialData.decision ?? null,
      decisionMethod: initialData.decisionMethod ?? null,
      reversibility: initialData.reversibility ?? "hat",
      stakeholders: initialData.stakeholders ?? [],
      driverStakeholderId: initialData.driverStakeholderId ?? "",
      supportingMaterials: initialData.supportingMaterials ?? [],
      organisationId: scope.organisationId,
      teamIds: initialData.teamIds ?? [],
      projectIds: initialData.projectIds ?? [],
      decisionNotes: initialData.decisionNotes ?? "",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    };

    // Filter out any undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    await setDoc(docRef, filteredData);

    return this.getById(docRef.id, scope);
  }

  async update(decision: Decision): Promise<void> {
    const scope: DecisionScope = {
      organisationId: decision.organisationId,
    };

    const docRef = doc(this.db, this.getDecisionPath(scope), decision.id);

    const data: Record<string, FieldValue | Partial<unknown> | undefined> = {
      title: decision.title,
      description: decision.description,
      cost: decision.cost,
      decision: decision.decision,
      decisionMethod: decision.decisionMethod,
      reversibility: decision.reversibility,
      stakeholders: decision.stakeholders,
      driverStakeholderId: decision.driverStakeholderId,
      supportingMaterials: decision.supportingMaterials,
      organisationId: decision.organisationId,
      teamIds: decision.teamIds,
      projectIds: decision.projectIds,
      publishDate: decision.publishDate,
      decisionNotes: decision.decisionNotes,
      updatedAt: serverTimestamp(),
    };

    // Filter out any undefined values
    const filteredData = Object.fromEntries(
      Object.entries(data).filter(([, value]) => value !== undefined),
    );

    await updateDoc(docRef, filteredData);
  }

  async delete(id: string, scope: DecisionScope): Promise<void> {
    const docRef = doc(this.db, this.getDecisionPath(scope), id);
    await deleteDoc(docRef);
  }

  subscribeToAll(
    onData: (decisions: Decision[]) => void,
    onError: (error: Error) => void,
    scope: DecisionScope,
  ): () => void {
    const q = collection(this.db, this.getDecisionPath(scope));

    return onSnapshot(
      q,
      (snapshot) => {
        const decisions = snapshot.docs.map((doc) =>
          this.decisionFromFirestore(doc),
        );
        onData(decisions);
      },
      onError,
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

    const docRef = doc(this.db, this.getDecisionPath(scope), decision.id);

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
      onError,
    );
  }

  private async getDecisionFromDecisionRelationship(
    decisionRelationship: DecisionRelationship,
  ): Promise<Decision> {
    const organisationId =
      DecisionRelationshipTools.getTargetDecisionOrganisationId(
        decisionRelationship,
      );
    const targetDecisionDoc = await getDoc(
      doc(
        this.db,
        "organisations",
        organisationId,
        "decisions",
        DecisionRelationshipTools.getTargetDecisionId(decisionRelationship),
      ),
    );
    if (!targetDecisionDoc.exists()) {
      throw new DecisionRelationshipError(
        `Decision relationship target decision ${DecisionRelationshipTools.getTargetDecisionId(decisionRelationship)} not found`,
      );
    }
    return this.decisionFromFirestore(
      targetDecisionDoc as QueryDocumentSnapshot<DocumentData>,
    );
  }

  private updateDecisionRelationships(
    batch: ReturnType<typeof writeBatch>,
    decision: Decision,
    relationships: Record<string, unknown> | undefined,
  ): void {
    const decisionRef = doc(
      this.db,
      this.getDecisionCollectionPathFromDecision(decision),
      decision.id,
    );
    batch.update(decisionRef, {
      relationships: relationships || {},
      updatedAt: serverTimestamp(),
    });
  }

  private async applyBidirectionalRelationshipChange(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
    operation: "add" | "remove",
  ): Promise<void> {
    // Validate the relationship if we're adding i
    if (operation === "add") {
      if (sourceDecision.id === DecisionRelationshipTools.getTargetDecisionId(targetDecisionRelationship)) {
        throw new DecisionRelationshipError(
          "A decision cannot have a relationship with itself",
        );
      }

      if (
        sourceDecision.organisationId !==
        DecisionRelationshipTools.getTargetDecisionOrganisationId(
          targetDecisionRelationship,
        )
      ) {
        throw new DecisionRelationshipError(
          "Decisions must belong to the same organisation",
        );
      }
    }

    // Get the target decision
    const targetDecision = await this.getDecisionFromDecisionRelationship(
      targetDecisionRelationship,
    );

    // Get the inverse relationship type
    const inverseType = DecisionRelationshipTools.getInverseRelationshipType(
      targetDecisionRelationship.type,
    );

    // Create a batch write
    const batch = writeBatch(this.db);

    // Update source decision relationships
    const updatedSourceDecision =
      operation === "add"
        ? sourceDecision.setRelationship(
            targetDecisionRelationship.type,
            targetDecision,
          )
        : sourceDecision.unsetRelationship(
            targetDecisionRelationship.type,
            DecisionRelationshipTools.getTargetDecisionId(targetDecisionRelationship),
          );
    this.updateDecisionRelationships(
      batch,
      sourceDecision,
      updatedSourceDecision.relationships,
    );

    // Update target decision relationships
    const updatedTargetDecision =
      operation === "add"
        ? targetDecision.setRelationship(inverseType, sourceDecision)
        : targetDecision.unsetRelationship(inverseType, sourceDecision.id);
    this.updateDecisionRelationships(
      batch,
      targetDecision,
      updatedTargetDecision.relationships,
    );

    // Commit the batch
    await batch.commit();
  }

  async addRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void> {
    await this.applyBidirectionalRelationshipChange(
      sourceDecision,
      targetDecisionRelationship,
      "add",
    );
  }

  async removeRelationship(
    sourceDecision: Decision,
    targetDecisionRelationship: DecisionRelationship,
  ): Promise<void> {
    await this.applyBidirectionalRelationshipChange(
      sourceDecision,
      targetDecisionRelationship,
      "remove",
    );
  }

  /**
   * Publishes a decision and updates relationship types on both sides.
   * - Transforms 'blocks' to 'did_block' on the published decision
   * - Transforms 'blocked_by' to 'was_blocked_by' on target decisions
   */
  async publishDecision(
    decisionId: string,
    scope: DecisionScope,
  ): Promise<Decision> {
    // 1. Get the decision to publish
    const decision = await this.getById(decisionId, scope);

    if (!decision) {
      throw new Error(`Decision with id ${decisionId} not found`);
    }

    // 2. Get blocks relationships that need to be transformed on target decisions
    const blocksRelationships = decision.getRelationshipsByType("blocks");

    // 3. Publish the decision (which transforms blocks→did_block on the decision itself)
    const publishedDecision = decision.publish();

    // 4. Update the published decision in Firestore
    await this.update(publishedDecision);

    // 5. Update all the target decisions that were previously blocked
    const batch = writeBatch(this.db);

    for (const relationship of blocksRelationships) {
      try {
        // Get the target decision that was blocked
        const targetDecision =
          await this.getDecisionFromDecisionRelationship(relationship);

        if (targetDecision && targetDecision.relationships) {
          // Find all relationships of type blocked_by that point to the published decision
          const blockedByRelationships = targetDecision
            .getRelationshipsByType("blocked_by")
            .filter((rel) => DecisionRelationshipTools.getTargetDecisionId(rel) === decisionId);

          if (blockedByRelationships.length > 0) {
            // Remove all blocked_by relationships and add was_blocked_by relationships
            const updatedDecision = targetDecision
              .unsetRelationship("blocked_by", decisionId)
              .setRelationship("was_blocked_by", decision);

            // Update the relationships in the batch
            this.updateDecisionRelationships(
              batch,
              targetDecision,
              updatedDecision.relationships,
            );
          }
        }
      } catch (error) {
        console.error(
          `Error updating relationship for target decision: ${error}`,
        );
      }
    }

    // Commit all the batched updates
    if (blocksRelationships.length > 0) {
      await batch.commit();
    }

    return publishedDecision;
  }

  async publish(decision: Decision): Promise<Decision> {
    // Get a fresh copy of the decision to ensure we have the latest relationships
    const freshDecision = await this.getById(decision.id, {
      organisationId: decision.organisationId,
    });

    // Start a batch write
    const batch = writeBatch(this.db);

    // Get all the decisions that this decision blocks
    const blocksRelationships = freshDecision.getRelationshipsByType("blocks");

    // Update the source decision's publish date and transform its "blocks" relationships to "did_block"
    const updatedRelationships = { ...freshDecision.relationships };
    for (const relationship of blocksRelationships) {
      // Find all keys that point to this relationship
      const keys = Object.entries(freshDecision.relationships || {})
        .filter(
          ([, rel]) =>
            DecisionRelationshipTools.getTargetDecisionId(rel) === DecisionRelationshipTools.getTargetDecisionId(relationship) &&
            rel.type === "blocks",
        )
        .map(([key]) => key);

      // Update each key to use the new relationship type
      for (const key of keys) {
        updatedRelationships[key] = {
          ...relationship,
          type: "did_block",
        };
      }
    }

    const decisionRef = doc(
      this.db,
      this.getDecisionCollectionPathFromDecision(freshDecision),
      freshDecision.id,
    );
    batch.update(decisionRef, {
      publishDate: serverTimestamp(),
      relationships: updatedRelationships,
      updatedAt: serverTimestamp(),
    });

    // Update all target decisions to transform their "blocked_by" relationships to "was_blocked_by"
    for (const relationship of blocksRelationships) {
      const targetDecision =
        await this.getDecisionFromDecisionRelationship(relationship);
      const targetRelationships = { ...targetDecision.relationships };

      // Find all keys that point to this relationship
      const inverseKeys = Object.entries(targetRelationships)
        .filter(
          ([, rel]) =>
            DecisionRelationshipTools.getTargetDecisionId(rel) === freshDecision.id &&
            rel.type === "blocked_by",
        )
        .map(([key]) => key);

      // Update each key to use the new relationship type
      for (const key of inverseKeys) {
        targetRelationships[key] = {
          ...targetRelationships[key],
          type: "was_blocked_by",
        };
      }

      if (inverseKeys.length > 0) {
        const targetRef = doc(
          this.db,
          this.getDecisionCollectionPathFromDecision(targetDecision),
          targetDecision.id,
        );
        batch.update(targetRef, {
          relationships: targetRelationships,
          updatedAt: serverTimestamp(),
        });
      }
    }

    // Commit all the updates
    await batch.commit();

    // Return the updated decision
    return this.getById(freshDecision.id, {
      organisationId: freshDecision.organisationId,
    });
  }
}
