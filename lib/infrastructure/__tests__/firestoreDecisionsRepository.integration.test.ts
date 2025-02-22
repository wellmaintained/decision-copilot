import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest'
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository'
import { Decision } from '@/lib/domain/Decision'
import { TEST_SCOPE, signInTestUser } from './helpers/firebaseTestHelper'
import { FirestoreDecisionRelationshipRepository } from '@/lib/infrastructure/firestoreDecisionRelationshipRepository';
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship';

describe('FirestoreDecisionsRepository Integration Tests', () => {
  const repository = new FirestoreDecisionsRepository();
  const decisionRelationshipRepository = new FirestoreDecisionRelationshipRepository();
  let sampleDecision: Decision;
  let sampleDecision2: Decision;
  let supersededRelationship: DecisionRelationship;

  beforeAll(async () => {
    await signInTestUser()
    const emptyDecision = Decision.createEmptyDecision();
    sampleDecision = await repository.create(
      emptyDecision
      .with({ title: 'Sample Decision' })
      .withoutId(),
      TEST_SCOPE
    );
    sampleDecision2 = await repository.create(
      emptyDecision
        .with({ title: 'Sample Decision 2 (superceeds Sample Decision)' })
        .withoutId(),
      TEST_SCOPE
    );
  })
  
  afterAll(async () => {
    try {
      if (supersededRelationship) {
        await decisionRelationshipRepository.removeRelationship(supersededRelationship);
      }
      await repository.delete(sampleDecision.id, TEST_SCOPE);
      await repository.delete(sampleDecision2.id, TEST_SCOPE);
    } catch (error) {
      console.error('Error in afterAll:', error);
      throw error;
    }
  })

  describe('create', () => {
    it('should have id, projectId, teamId, organisationId set to the scope values', async () => {

      expect(sampleDecision.id).toBeDefined();
      expect(sampleDecision.projectId).toBe(TEST_SCOPE.projectId);
      expect(sampleDecision.teamId).toBe(TEST_SCOPE.teamId);
      expect(sampleDecision.organisationId).toBe(TEST_SCOPE.organisationId);
    })
  })

  describe('subscribeToOne', () => {
    it('should receive updates when a decision is modified', async () => {
      const decisionId = sampleDecision.id;
      const decisionsFromSubscribeToOne: (Decision | null)[] = []
      const onError = vi.fn()
      
      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>(async (resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (decisionsFromSubscribeToOne.length === 2) {
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToOne(
          decisionId,
          (decision) => {
            console.debug('Received decision update:', decision?.title ?? 'null')
            decisionsFromSubscribeToOne.push(decision)
            checkIfAllUpdatesReceived();
          },
          onError,
          TEST_SCOPE
        );

        // Update the decision title
        repository.update(
          sampleDecision.with({ title: 'Sample Decision [UPDATED]' }),
          TEST_SCOPE
        );

        return unsubscribe;
      });
      
      // Wait for both updates to be received
      await allUpdatesReceived;
      
      // Verify results
      expect(decisionsFromSubscribeToOne.length).toBe(2)
      expect(decisionsFromSubscribeToOne[0]?.title).toBe('Sample Decision')
      expect(decisionsFromSubscribeToOne[1]?.title).toBe('Sample Decision [UPDATED]')
      expect(onError).not.toHaveBeenCalled()
    })

    it('changes to decision relationships update the affected decisions', async () => {
      const decisionsFromSubscribeToOne: Map<number, Decision> = new Map<number, Decision>();
      var updatesRecievedFromSubscribeToOne = 0; 
      const onError = vi.fn()
      
      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>( (resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (updatesRecievedFromSubscribeToOne === 2) {
            console.debug('All expected updates received:');
            console.debug('decisions from subscribeToOne', decisionsFromSubscribeToOne);
            console.debug('unsubscribing from subscribeToOne');
            unsubscribe();
            resolve();
          }
        };
        
        // Subscribe to changes
        const unsubscribe = repository.subscribeToOne(
          sampleDecision2.id,
          (decision) => {
            console.debug('decision from subscribeToOne', decision);
            updatesRecievedFromSubscribeToOne = updatesRecievedFromSubscribeToOne + 1;
            decisionsFromSubscribeToOne.set(updatesRecievedFromSubscribeToOne, decision)
            checkIfAllUpdatesReceived();
          },
          onError,
          TEST_SCOPE
        );
      
        // Add a relationship indicating the supersededDecision
        supersededRelationship = DecisionRelationship.create({
          fromTeamId: sampleDecision2.teamId,
          fromProjectId: sampleDecision2.projectId,
          fromDecisionId: sampleDecision2.id,
          type: 'supersedes',
          toDecisionId: sampleDecision.id,
          toTeamId: sampleDecision.teamId,
          toProjectId: sampleDecision.projectId,
          organisationId: TEST_SCOPE.organisationId,
          createdAt: new Date(),
        });
        decisionRelationshipRepository.addRelationship(supersededRelationship);
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled()

      // Initial decision has no relationships
      expect(decisionsFromSubscribeToOne.get(1)?.relationships?.length).toBe(0)
      // Updated decision has one supercedes relationship
      expect(decisionsFromSubscribeToOne.get(2)?.relationships?.length).toBe(1)
      expect(decisionsFromSubscribeToOne.get(2)?.relationships?.[0].type).toBe('supersedes')
      expect(decisionsFromSubscribeToOne.get(2)?.relationships?.[0].toDecisionId).toBe(sampleDecision.id)
    })
  })
})