import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest'
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository'
import { Decision } from '@/lib/domain/Decision'
import { TEST_SCOPE, signInTestUser } from './helpers/firebaseTestHelper'
import { FirestoreDecisionRelationshipRepository } from '@/lib/infrastructure/firestoreDecisionRelationshipRepository';
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship';

describe('FirestoreDecisionsRepository Integration Tests', () => {
  const repository = new FirestoreDecisionsRepository();
  const decisionRelationshipRepository = new FirestoreDecisionRelationshipRepository();
  const emptyDecision = Decision.createEmptyDecision();
  let sampleDecision: Decision;
  let sampleDecision2: Decision;
  var relationshipsToCleanUp: DecisionRelationship[] = [];

  beforeAll(async () => {
    await signInTestUser()
  })

  beforeEach(async () => {
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
  
  afterEach(async () => {
    console.debug(`cleaning up relationships created by this test: ${relationshipsToCleanUp.map(r => r.id).join(', ')}`);
    for (const relationship of relationshipsToCleanUp) {
      await decisionRelationshipRepository.removeRelationship(relationship);
    }
    await repository.delete(sampleDecision.id, TEST_SCOPE);
    await repository.delete(sampleDecision2.id, TEST_SCOPE);
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
      const decisionsFromSubscribeToOne: Map<number, Decision> = new Map<number, Decision>();
      var updatesRecievedFromSubscribeToOne = 0; 
      const onError = vi.fn()
      
      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>(async (resolve) => {
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
          decisionId,
          (decision) => {
            console.debug('Received decision update:', decision?.title ?? 'null')
            updatesRecievedFromSubscribeToOne = updatesRecievedFromSubscribeToOne + 1;
            decisionsFromSubscribeToOne.set(updatesRecievedFromSubscribeToOne, decision)
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
      expect(onError).not.toHaveBeenCalled()

      // We expect 2 updates, the initial and the updated decision
      expect(decisionsFromSubscribeToOne.size).toBe(2)

      // The first update should be the initial decision
      expect(decisionsFromSubscribeToOne.get(1)?.title).toBe('Sample Decision')

      // The second update should be the updated decision
      expect(decisionsFromSubscribeToOne.get(2)?.title).toBe('Sample Decision [UPDATED]')
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
        const supersededRelationship = DecisionRelationship.create({
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
        relationshipsToCleanUp.push(supersededRelationship);
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled()

      // Initial decision has no relationships
      expect(decisionsFromSubscribeToOne.get(1)?.relationships?.length).toBe(0)
      // Updated decision has one supercedes relationship
      expect(decisionsFromSubscribeToOne.get(2)?.supersedes.length).toBe(1)
      expect(decisionsFromSubscribeToOne.get(2)?.supersedes[0].toDecisionId).toBe(sampleDecision.id)
    })
  })

  describe('subscribeToAll', () => {
    it('should receive updates when a decision is modified', async () => {
      const decisionsFromSubscribeToAll: Map<number, Decision[]> = new Map<number, Decision[]>();
      var updatesReceivedFromSubscribeToAll = 0; 
      const onError = vi.fn()
      
      // Create a promise that resolves when we get both the initial and updated decisions
      const allUpdatesReceived = new Promise<void>(async (resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (updatesReceivedFromSubscribeToAll === 2) {
            console.debug('All expected updates received:');
            console.debug('decisions from subscribeToAll', decisionsFromSubscribeToAll);
            console.debug('unsubscribing from subscribeToAll');
            unsubscribe();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToAll(
          (decisions) => {
            updatesReceivedFromSubscribeToAll = updatesReceivedFromSubscribeToAll + 1;
            console.debug(`Received decisions update #${updatesReceivedFromSubscribeToAll}:`, decisions.map(d => d.title));
            decisionsFromSubscribeToAll.set(updatesReceivedFromSubscribeToAll, decisions);
            checkIfAllUpdatesReceived();
          },
          onError,
          TEST_SCOPE
        );

        // Update one of the decisions
        repository.update(
          sampleDecision.with({ title: 'Sample Decision [UPDATED FROM SUBSCRIBE ALL]' }),
          TEST_SCOPE
        );

        return unsubscribe;
      });
      
      // Wait for both updates to be received
      await allUpdatesReceived;
      
      // Verify results
      expect(onError).not.toHaveBeenCalled()

      // We expect 2 updates
      expect(decisionsFromSubscribeToAll.size).toBe(2)

      // Find the sample decision in each update
      const initialSampleDecision = decisionsFromSubscribeToAll.get(1)?.find(d => d.id === sampleDecision.id);
      const updatedSampleDecision = decisionsFromSubscribeToAll.get(2)?.find(d => d.id === sampleDecision.id);

      // The first update should have the initial title
      expect(initialSampleDecision?.title).toBe('Sample Decision')

      // The second update should have the updated title
      expect(updatedSampleDecision?.title).toBe('Sample Decision [UPDATED FROM SUBSCRIBE ALL]')
    })

    it('changes to decision relationships update the affected decisions in the list', async () => {
      const decisionsFromSubscribeToAll: Map<number, Decision[]> = new Map<number, Decision[]>();
      var updatesReceivedFromSubscribeToAll = 0; 
      const onError = vi.fn()
      let unsubscribe: (() => void) | undefined;
      
      // Create a promise that resolves when we get both the initial and updated decisions
      const allUpdatesReceived = new Promise<void>(async (resolve, reject) => {
        let timeoutId: NodeJS.Timeout;

        const cleanup = () => {
          if (timeoutId) clearTimeout(timeoutId);
          if (unsubscribe) unsubscribe();
        };

        // Set a timeout that will provide more debug info
        timeoutId = setTimeout(() => {
          console.error('Test timed out. Current state:', {
            updatesReceived: updatesReceivedFromSubscribeToAll,
            decisions: decisionsFromSubscribeToAll
          });
          cleanup();
          reject(new Error('Test timed out waiting for updates'));
        }, 8000);

        const checkIfAllUpdatesReceived = () => {
          // We expect at least 2 updates
          if (updatesReceivedFromSubscribeToAll >= 2) {
            // Get the latest update
            const latestUpdate = decisionsFromSubscribeToAll.get(updatesReceivedFromSubscribeToAll);
            if (!latestUpdate) return;

            // Find sampleDecision2 in the latest update
            const updatedDecision = latestUpdate.find(d => d.id === sampleDecision2.id);
            if (!updatedDecision) return;

            // Check if the relationship has been attached
            if (updatedDecision.supersedes?.length === 1) {
              console.debug('All expected updates received:');
              console.debug('decisions from subscribeToAll', decisionsFromSubscribeToAll);
              console.debug('unsubscribing from subscribeToAll');
              cleanup();
              resolve();
            }
          }
        };

        // Subscribe to changes
        unsubscribe = repository.subscribeToAll(
          (decisions) => {
            updatesReceivedFromSubscribeToAll = updatesReceivedFromSubscribeToAll + 1;
            console.debug(`Received decisions update #${updatesReceivedFromSubscribeToAll}:`, 
              decisions.map(d => ({
                id: d.id,
                title: d.title,
                relationshipsCount: d.relationships?.length || 0,
                supersedesCount: d.supersedes?.length || 0
              }))
            );
            decisionsFromSubscribeToAll.set(updatesReceivedFromSubscribeToAll, decisions);
            checkIfAllUpdatesReceived();
          },
          (error) => {
            console.error('Error in subscription:', error);
            onError(error);
            cleanup();
            reject(error);
          },
          TEST_SCOPE
        );

        // Wait for the initial update before adding the relationship
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add a relationship indicating the supersededDecision
        const supersededRelationship = DecisionRelationship.create({
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

        try {
          await decisionRelationshipRepository.addRelationship(supersededRelationship);
          console.debug('Relationship added successfully');
          relationshipsToCleanUp.push(supersededRelationship);
        } catch (error) {
          console.error('Failed to add relationship:', error);
          cleanup();
          reject(error);
        }
      });

      try {
        // Wait for both updates to be received
        await allUpdatesReceived;

        expect(onError).not.toHaveBeenCalled()

        // Find sampleDecision2 in each update
        const initialDecision = decisionsFromSubscribeToAll.get(1)?.find(d => d.id === sampleDecision2.id);
        const finalUpdate = Array.from(decisionsFromSubscribeToAll.values()).pop();
        const updatedDecision = finalUpdate?.find(d => d.id === sampleDecision2.id);

        // Initial decision has no relationships
        expect(initialDecision?.relationships?.length).toBe(0)
        
        // Updated decision has one supersedes relationship
        expect(updatedDecision?.supersedes.length).toBe(1)
        expect(updatedDecision?.supersedes[0].toDecisionId).toBe(sampleDecision.id)
      } finally {
        if (unsubscribe) unsubscribe();
      }
    }, 15000) // Increase timeout to 15 seconds
  })
})