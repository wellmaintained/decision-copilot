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
  let supersededDecision: Decision;
  let supersededRelationshipId: string;

  beforeAll(async () => {
    await signInTestUser()
    const emptyDecision = Decision.createEmptyDecision();
    supersededDecision = await repository.create(
      emptyDecision
        .with({ title: 'Superseded Decision' })
        .withoutId(),
      TEST_SCOPE
    );
    sampleDecision = await repository.create(
      emptyDecision
      .with({ title: 'Sample Decision' })
      .withoutId(),
      TEST_SCOPE
    );
  })
  
  beforeEach(async () => {
  })
  
  afterEach(async () => {
  })

  afterAll(async () => {
    try {
      if (supersededRelationshipId) {
        await decisionRelationshipRepository.removeRelationship(supersededRelationshipId, TEST_SCOPE.organisationId);
      }
      await repository.delete(sampleDecision.id, TEST_SCOPE);
      await repository.delete(supersededDecision.id, TEST_SCOPE);
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
          sampleDecision.id,
          (decision) => {
            console.debug(decision);
            decisionsFromSubscribeToOne.push(decision)
            checkIfAllUpdatesReceived();
          },
          onError,
          TEST_SCOPE
        );
      
        // Add a relationship indicating the sampleDecision supersedes supersededDecision
        const relationship = DecisionRelationship.create({
          fromDecisionId: sampleDecision.id,
          toDecisionId: supersededDecision.id,
          type: 'supersedes',
          createdAt: new Date(),
          fromTeamId: sampleDecision.teamId,
          fromProjectId: sampleDecision.projectId,
          toTeamId: supersededDecision.teamId,
          toProjectId: supersededDecision.projectId,
          organisationId: TEST_SCOPE.organisationId
        });
        supersededRelationshipId = relationship.id;
        await decisionRelationshipRepository.addRelationship(relationship);

        return unsubscribe;
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      // Verify results
      expect(decisionsFromSubscribeToOne.length).toBe(2)
      expect(decisionsFromSubscribeToOne[0]?.relationships?.length).toBe(0)
      expect(decisionsFromSubscribeToOne[1]?.relationships?.length).toBe(1)
      expect(decisionsFromSubscribeToOne[1]?.relationships?.[0].type).toBe('supersedes')
      expect(decisionsFromSubscribeToOne[1]?.relationships?.[0].toDecisionId).toBe(supersededDecision.id)
      expect(onError).not.toHaveBeenCalled()
    })
  })
})