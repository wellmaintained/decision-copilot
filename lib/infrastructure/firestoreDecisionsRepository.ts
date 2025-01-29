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
} from "firebase/firestore";
import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'

/**
 * Single Responsibility:
 * - Implements DecisionsRepository for Firestore
 * - Translates raw data into domain Decision objects, and handles updates
 */
export class FirestoreDecisionsRepository implements DecisionsRepository {
  private getDecisionPath(scope: DecisionScope) {
    return `organisations/${scope.organisationId}/teams/${scope.teamId}/projects/${scope.projectId}/decisions`
  }

  private getRelationshipsPath(organisationId: string) {
    return `organisations/${organisationId}/decisionRelationships`
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
      blockedByDecisionIds: data.blockedByDecisionIds || []
    })
  }

  async getAll(scope: DecisionScope): Promise<Decision[]> {
    const q = collection(db, this.getDecisionPath(scope))
    const querySnapshot = await getDocs(q)
    return querySnapshot.docs.map(doc => this.decisionFromFirestore(doc, scope))
  }

  async getById(id: string, scope: DecisionScope): Promise<Decision | null> {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    const docSnap = await getDoc(docRef)
    
    if (!docSnap.exists()) {
      return null
    }

    return this.decisionFromFirestore(docSnap, scope)
  }

  async create(initialData: Partial<Omit<DecisionProps, "id">>, scope: DecisionScope): Promise<Decision> {
    const docRef = doc(collection(db, this.getDecisionPath(scope)))
    const now = new Date()
    
    const decision = Decision.create({
      id: docRef.id,
      title: '',
      description: '',
      cost: 'low',
      createdAt: now,
      updatedAt: now,
      criteria: [],
      options: [],
      reversibility: 'hat',
      stakeholders: [],
      status: 'draft',
      driverStakeholderId: '',
      supportingMaterials: [],
      organisationId: scope.organisationId,
      teamId: scope.teamId,
      projectId: scope.projectId,
      blockedByDecisionIds: [],
      ...initialData
    } as DecisionProps)

    // Create a data object with only defined values
    const createData: Record<string, any> = {
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
      blockedByDecisionIds: decision.blockedByDecisionIds,
      createdAt: Timestamp.fromDate(decision.createdAt),
      updatedAt: Timestamp.fromDate(decision.updatedAt || new Date())
    }

    // Only include supersededByDecisionId if it's defined
    if (decision.supersededByDecisionId) {
      createData.supersededByDecisionId = decision.supersededByDecisionId
    }

    await setDoc(docRef, createData)

    return decision
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
      blockedByDecisionIds: decision.blockedByDecisionIds,
      updatedAt: Timestamp.fromDate(new Date())
    }

    // Only include supersededByDecisionId if it's defined
    if (decision.supersededByDecisionId) {
      updateData.supersededByDecisionId = decision.supersededByDecisionId
    }
    
    await updateDoc(docRef, updateData)
  }

  async delete(id: string, scope: DecisionScope): Promise<void> {
    // Check for any relationships where this decision is referenced
    const relationshipsQuery = query(
      collection(db, this.getRelationshipsPath(scope.organisationId)),
      where('fromDecisionId', '==', id)
    )
    const toRelationshipsQuery = query(
      collection(db, this.getRelationshipsPath(scope.organisationId)),
      where('toDecisionId', '==', id)
    )

    const [fromRelationships, toRelationships] = await Promise.all([
      getDocs(relationshipsQuery),
      getDocs(toRelationshipsQuery)
    ])

    if (!fromRelationships.empty || !toRelationships.empty) {
      const relationships = [...fromRelationships.docs, ...toRelationships.docs]
      const relationshipTypes = relationships.map(r => r.data().type)
      
      const blockingCount = relationshipTypes.filter(t => t === 'blocks').length
      const supersedesCount = relationshipTypes.filter(t => t === 'supersedes').length

      let errorMessage = 'Cannot delete decision that is still referenced by relationships:'
      if (blockingCount > 0) {
        errorMessage += `\n- Used in ${blockingCount} blocking relationship${blockingCount > 1 ? 's' : ''}`
      }
      if (supersedesCount > 0) {
        errorMessage += `\n- Used in ${supersedesCount} supersedes relationship${supersedesCount > 1 ? 's' : ''}`
      }
      errorMessage += '\nPlease remove these relationships before deleting the decision.'

      throw new Error(errorMessage)
    }

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
    onData: (decision: Decision | null) => void,
    onError: (error: Error) => void,
    scope: DecisionScope
  ): () => void {
    const docRef = doc(db, this.getDecisionPath(scope), id)
    
    return onSnapshot(
      docRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          onData(null)
          return
        }
        
        const decision = this.decisionFromFirestore(snapshot, scope)
        onData(decision)
      },
      onError
    )
  }

  // Relationship methods
  private async checkForCyclicRelationship(
    fromDecisionId: string,
    toDecisionId: string,
    type: DecisionRelationshipType,
    organisationId: string
  ): Promise<boolean> {
    const visited = new Set<string>()
    const stack = new Set<string>()

    const traverse = async (currentId: string): Promise<boolean> => {
      if (stack.has(currentId)) return true // Found cycle
      if (visited.has(currentId)) return false
      
      visited.add(currentId)
      stack.add(currentId)

      const q = query(
        collection(db, this.getRelationshipsPath(organisationId)),
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

    return traverse(toDecisionId)
  }

  async addBlockingRelationship(
    blockingDecisionId: string,
    blockedDecisionId: string,
    organisationId: string
  ): Promise<void> {
    // Check for cycles
    const wouldCreateCycle = await this.checkForCyclicRelationship(
      blockingDecisionId,
      blockedDecisionId,
      'blocks',
      organisationId
    )
    if (wouldCreateCycle) {
      throw new Error('Cannot create cyclic blocking relationship')
    }

    // Get both decisions to verify they exist and get their metadata
    const blockingDecision = await this.findDecisionInOrg(blockingDecisionId, organisationId)
    const blockedDecision = await this.findDecisionInOrg(blockedDecisionId, organisationId)

    if (!blockingDecision || !blockedDecision) {
      throw new Error('One or both decisions not found')
    }

    const relationshipId = DecisionRelationship.createId(blockingDecisionId, blockedDecisionId)
    const relationshipRef = doc(db, this.getRelationshipsPath(organisationId), relationshipId)

    const batch = writeBatch(db)

    // Create the relationship
    batch.set(relationshipRef, {
      fromDecisionId: blockingDecisionId,
      toDecisionId: blockedDecisionId,
      type: 'blocks' as DecisionRelationshipType,
      createdAt: Timestamp.now(),
      fromTeamId: blockingDecision.teamId,
      fromProjectId: blockingDecision.projectId,
      toTeamId: blockedDecision.teamId,
      toProjectId: blockedDecision.projectId
    })

    // Update the blocked decision's blockedByDecisionIds
    const blockedDecisionRef = doc(
      db,
      this.getDecisionPath({
        organisationId,
        teamId: blockedDecision.teamId,
        projectId: blockedDecision.projectId
      }),
      blockedDecisionId
    )

    batch.update(blockedDecisionRef, {
      blockedByDecisionIds: [...blockedDecision.blockedByDecisionIds, blockingDecisionId]
    })

    await batch.commit()
  }

  async removeBlockingRelationship(
    blockingDecisionId: string,
    blockedDecisionId: string,
    organisationId: string
  ): Promise<void> {
    const relationshipId = DecisionRelationship.createId(blockingDecisionId, blockedDecisionId)
    const relationshipRef = doc(db, this.getRelationshipsPath(organisationId), relationshipId)

    const blockedDecision = await this.findDecisionInOrg(blockedDecisionId, organisationId)
    if (!blockedDecision) {
      throw new Error('Blocked decision not found')
    }

    const batch = writeBatch(db)

    // Delete the relationship
    batch.delete(relationshipRef)

    // Update the blocked decision's blockedByDecisionIds
    const blockedDecisionRef = doc(
      db,
      this.getDecisionPath({
        organisationId,
        teamId: blockedDecision.teamId,
        projectId: blockedDecision.projectId
      }),
      blockedDecisionId
    )

    batch.update(blockedDecisionRef, {
      blockedByDecisionIds: blockedDecision.blockedByDecisionIds.filter(id => id !== blockingDecisionId)
    })

    await batch.commit()
  }

  async markAsSuperseded(
    oldDecisionId: string,
    newDecisionId: string,
    organisationId: string
  ): Promise<void> {
    // Check for cycles
    const wouldCreateCycle = await this.checkForCyclicRelationship(
      newDecisionId,
      oldDecisionId,
      'supersedes',
      organisationId
    )
    if (wouldCreateCycle) {
      throw new Error('Cannot create cyclic supersession relationship')
    }

    const oldDecision = await this.findDecisionInOrg(oldDecisionId, organisationId)
    const newDecision = await this.findDecisionInOrg(newDecisionId, organisationId)

    if (!oldDecision || !newDecision) {
      throw new Error('One or both decisions not found')
    }

    if (oldDecision.status === 'superseded') {
      throw new Error('Decision is already superseded')
    }

    const relationshipId = DecisionRelationship.createId(newDecisionId, oldDecisionId)
    const relationshipRef = doc(db, this.getRelationshipsPath(organisationId), relationshipId)

    const batch = writeBatch(db)

    // Create the relationship
    batch.set(relationshipRef, {
      fromDecisionId: newDecisionId,
      toDecisionId: oldDecisionId,
      type: 'supersedes' as DecisionRelationshipType,
      createdAt: Timestamp.now(),
      fromTeamId: newDecision.teamId,
      fromProjectId: newDecision.projectId,
      toTeamId: oldDecision.teamId,
      toProjectId: oldDecision.projectId
    })

    // Update the old decision
    const oldDecisionRef = doc(
      db,
      this.getDecisionPath({
        organisationId,
        teamId: oldDecision.teamId,
        projectId: oldDecision.projectId
      }),
      oldDecisionId
    )

    batch.update(oldDecisionRef, {
      status: 'superseded',
      supersededByDecisionId: newDecisionId
    })

    await batch.commit()
  }

  private async findDecisionInOrg(
    decisionId: string,
    organisationId: string
  ): Promise<Decision | null> {
    // Query all teams/projects in the org for this decision
    const teamsSnapshot = await getDocs(collection(db, `organisations/${organisationId}/teams`))
    
    for (const teamDoc of teamsSnapshot.docs) {
      const projectsSnapshot = await getDocs(collection(db, `organisations/${organisationId}/teams/${teamDoc.id}/projects`))
      
      for (const projectDoc of projectsSnapshot.docs) {
        const decisionRef = doc(db, `organisations/${organisationId}/teams/${teamDoc.id}/projects/${projectDoc.id}/decisions`, decisionId)
        const decisionSnap = await getDoc(decisionRef)
        
        if (decisionSnap.exists()) {
          return this.decisionFromFirestore(decisionSnap, {
            organisationId,
            teamId: teamDoc.id,
            projectId: projectDoc.id
          })
        }
      }
    }
    
    return null
  }

  async getBlockedDecisions(
    blockingDecisionId: string,
    organisationId: string
  ): Promise<Decision[]> {
    const q = query(
      collection(db, this.getRelationshipsPath(organisationId)),
      where('fromDecisionId', '==', blockingDecisionId),
      where('type', '==', 'blocks')
    )
    const relationships = await getDocs(q)
    
    const decisions: Decision[] = []
    for (const rel of relationships.docs) {
      const data = rel.data()
      const decision = await this.findDecisionInOrg(data.toDecisionId, organisationId)
      if (decision) decisions.push(decision)
    }
    
    return decisions
  }

  async getBlockingDecisions(
    blockedDecisionId: string,
    organisationId: string
  ): Promise<Decision[]> {
    const q = query(
      collection(db, this.getRelationshipsPath(organisationId)),
      where('toDecisionId', '==', blockedDecisionId),
      where('type', '==', 'blocks')
    )
    const relationships = await getDocs(q)
    
    const decisions: Decision[] = []
    for (const rel of relationships.docs) {
      const data = rel.data()
      const decision = await this.findDecisionInOrg(data.fromDecisionId, organisationId)
      if (decision) decisions.push(decision)
    }
    
    return decisions
  }

  async getSupersededDecisions(
    supersedingDecisionId: string,
    organisationId: string
  ): Promise<Decision[]> {
    const q = query(
      collection(db, this.getRelationshipsPath(organisationId)),
      where('fromDecisionId', '==', supersedingDecisionId),
      where('type', '==', 'supersedes')
    )
    const relationships = await getDocs(q)
    
    const decisions: Decision[] = []
    for (const rel of relationships.docs) {
      const data = rel.data()
      const decision = await this.findDecisionInOrg(data.toDecisionId, organisationId)
      if (decision) decisions.push(decision)
    }
    
    return decisions
  }

  async getSupersedingDecision(
    supersededDecisionId: string,
    organisationId: string
  ): Promise<Decision | null> {
    const q = query(
      collection(db, this.getRelationshipsPath(organisationId)),
      where('toDecisionId', '==', supersededDecisionId),
      where('type', '==', 'supersedes')
    )
    const relationships = await getDocs(q)
    
    if (relationships.empty) return null
    
    const data = relationships.docs[0].data()
    return this.findDecisionInOrg(data.fromDecisionId, organisationId)
  }
}
