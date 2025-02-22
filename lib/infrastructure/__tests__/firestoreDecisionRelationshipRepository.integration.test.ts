import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest'
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository'
import { FirestoreDecisionRelationshipRepository } from '@/lib/infrastructure/firestoreDecisionRelationshipRepository'
import { Decision } from '@/lib/domain/Decision'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'
import { TEST_SCOPE, signInTestUser } from './helpers/firebaseTestHelper'
import { DecisionRelationshipError } from '@/lib/domain/DecisionError'

describe('FirestoreDecisionRelationshipRepository Integration Tests', () => {
  const repository = new FirestoreDecisionRelationshipRepository();
  const decisionsRepository = new FirestoreDecisionsRepository();
  let decisionA: Decision;
  let decisionB: Decision;
  let decisionC: Decision;
  var relationshipsToCleanUp: DecisionRelationship[] = [];

  beforeAll(async () => {
    await signInTestUser()
    const emptyDecision = Decision.createEmptyDecision();
    
    // Create test decisions
    decisionA = await decisionsRepository.create(
      emptyDecision
        .with({ title: 'Decision A' })
        .withoutId(),
      TEST_SCOPE
    );

    decisionB = await decisionsRepository.create(
      emptyDecision
        .with({ title: 'Decision B' })
        .withoutId(),
      TEST_SCOPE
    );

    decisionC = await decisionsRepository.create(
      emptyDecision
        .with({ title: 'Decision C' })
        .withoutId(),
      TEST_SCOPE
    );
  })

  afterEach(async () => {
    console.debug(`cleaning up relationships created by this test: ${relationshipsToCleanUp.map(r => r.id).join(', ')}`);
    for (const relationship of relationshipsToCleanUp) {
      await repository.removeRelationship(relationship);
    }
  })

  afterAll(async () => {
    try {
      // Clean up test decisions
      await decisionsRepository.delete(decisionA.id, TEST_SCOPE);
      await decisionsRepository.delete(decisionB.id, TEST_SCOPE);
      await decisionsRepository.delete(decisionC.id, TEST_SCOPE);
    } catch (error) {
      console.error('Error in afterAll:', error);
      throw error;
    }
  })

  describe('subscribeToDecisionRelationships', () => {
    it('should receive updates when relationships are added', async () => {
      const relationshipsForAFromSubscribe: Map<number, DecisionRelationship[]> = new Map<number, DecisionRelationship[]>;
      var updatesRecievedForA = 0;
      const relationshipsForBFromSubscribe: Map<number, DecisionRelationship[]> = new Map<number, DecisionRelationship[]>;
      var updatesRecievedForB = 0;
      const relationshipsForCFromSubscribe: Map<number, DecisionRelationship[]> = new Map<number, DecisionRelationship[]>;
      var updatesRecievedForC = 0;
      const onError = vi.fn()
      
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (
            updatesRecievedForA === 1 &&
            updatesRecievedForB === 2 &&
            updatesRecievedForC === 1
          ) {
            console.debug('All expected updates received:');
            console.debug('relationships for A', relationshipsForAFromSubscribe);
            console.debug('relationships for B', relationshipsForBFromSubscribe);
            console.debug('relationships for C', relationshipsForCFromSubscribe);

            console.debug('Unsubscribing...');
            unsubscribeA();
            unsubscribeB();
            unsubscribeC();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribeA = repository.subscribeToDecisionRelationships(
          decisionA,
          (relationships) => {
            updatesRecievedForA = updatesRecievedForA + 1;
            console.debug(`received update #${updatesRecievedForA} for subscription to Decision A`, relationships);
            relationshipsForAFromSubscribe.set(updatesRecievedForA, relationships);
            checkIfAllUpdatesReceived();
          },
          onError
        );
        const unsubscribeB = repository.subscribeToDecisionRelationships(
          decisionB,
          (relationships) => {
            updatesRecievedForB = updatesRecievedForB + 1;
            console.debug(`received update #${updatesRecievedForB} for subscription to Decision B`, relationships);
            relationshipsForBFromSubscribe.set(updatesRecievedForB, relationships);
            checkIfAllUpdatesReceived();
          },
          onError
        );
        const unsubscribeC = repository.subscribeToDecisionRelationships(
          decisionC,
          (relationships) => {
            updatesRecievedForC = updatesRecievedForC + 1;
            console.debug(`received update #${updatesRecievedForC} for subscription to Decision C`, relationships);
            relationshipsForCFromSubscribe.set(updatesRecievedForC, relationships);
            checkIfAllUpdatesReceived();
          },
          onError
        );

        // Create a blocking relationship
        const blockingRelationship = DecisionRelationship.createBlockingRelationship(decisionA, decisionB);
        repository.addRelationship(blockingRelationship);
        relationshipsToCleanUp.push(blockingRelationship);

        // Create a superseding relationship
        const supersedingRelationship = DecisionRelationship.createSupersedingRelationship(decisionB, decisionC);
        repository.addRelationship(supersedingRelationship);
        relationshipsToCleanUp.push(supersedingRelationship);
      });

      // Wait for all updates to be received
      await allUpdatesReceived;
      // Verify results for decision A
      // we expect 1 relationship for A - the blocking relationship between A and B
      expect(relationshipsForAFromSubscribe.get(1)?.[0].type).toBe('blocked_by')
      expect(relationshipsForAFromSubscribe.get(1)?.[0].fromDecisionId).toBe(decisionA.id)
      expect(relationshipsForAFromSubscribe.get(1)?.[0].toDecisionId).toBe(decisionB.id)

      // Verify results for decision B
      // we expect 2 relationships for B (which will have come through in the 2nd update)
      // - the blocking relationship between A and B, and the superseding relationship between B and C
      const blockingReloadshipforB = relationshipsForBFromSubscribe.get(2)?.find(r => r.type === 'blocked_by')
      expect(blockingReloadshipforB?.fromDecisionId).toBe(decisionA.id)
      expect(blockingReloadshipforB?.toDecisionId).toBe(decisionB.id)
      const supersedingReloadshipforB = relationshipsForBFromSubscribe.get(2)?.find(r => r.type === 'supersedes')
      expect(supersedingReloadshipforB?.fromDecisionId).toBe(decisionB.id)
      expect(supersedingReloadshipforB?.toDecisionId).toBe(decisionC.id)

      // Verify results for decision C
      // we expect 1 relationship for C - the superseding relationship between B and C
      expect(relationshipsForCFromSubscribe.get(1)?.[0].type).toBe('supersedes')
      expect(relationshipsForCFromSubscribe.get(1)?.[0].fromDecisionId).toBe(decisionB.id)
      expect(relationshipsForCFromSubscribe.get(1)?.[0].toDecisionId).toBe(decisionC.id)

      // Verify that the onError callback was not called
      expect(onError).not.toHaveBeenCalled()
    })
    it('should receive updates when relationships are removed', async () => {
      const relationshipsForAFromSubscribe: Map<number, DecisionRelationship[]> = new Map<number, DecisionRelationship[]>;
      var updatesRecievedForA = 0;
      const relationshipsForBFromSubscribe: Map<number, DecisionRelationship[]> = new Map<number, DecisionRelationship[]>;
      var updatesRecievedForB = 0;
      const onError = vi.fn()

      // Create a blocking relationship
      const blockingRelationship = DecisionRelationship.createBlockingRelationship(decisionA, decisionB);
      await repository.addRelationship(blockingRelationship);
      relationshipsToCleanUp.push(blockingRelationship);
      
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
            if (
                updatesRecievedForA === 2 &&
                updatesRecievedForB === 2 
            ) {
              console.debug('All expected updates received:');
              console.debug('relationships for A', relationshipsForAFromSubscribe);
              console.debug('relationships for B', relationshipsForBFromSubscribe);
              console.debug('Unsubscribing...');
              unsubscribeA();
              unsubscribeB();
              resolve();
          }
        };

        // Subscribe to changes
        const unsubscribeA = repository.subscribeToDecisionRelationships(
          decisionA,
          (relationships) => {
            updatesRecievedForA = updatesRecievedForA + 1;
            console.debug(`received update #${updatesRecievedForA} for subscription to Decision A`, relationships);
            relationshipsForAFromSubscribe.set(updatesRecievedForA, relationships);
            checkIfAllUpdatesReceived();
          },
          onError
        );
        const unsubscribeB = repository.subscribeToDecisionRelationships(
          decisionB,
          (relationships) => {
            updatesRecievedForB = updatesRecievedForB + 1;
            console.debug(`received update #${updatesRecievedForB} for subscription to Decision B`, relationships);
            relationshipsForBFromSubscribe.set(updatesRecievedForB, relationships);
            checkIfAllUpdatesReceived();
          },
          onError
        );

        // Remove the blocking relationship 
        repository.removeRelationship(blockingRelationship);
      });

      // Wait for all updates to be received
      await allUpdatesReceived;

      // The first update for each should have been registering the initial relationship
      expect(relationshipsForAFromSubscribe.get(1)?.length).toBe(1)
      expect(relationshipsForBFromSubscribe.get(1)?.length).toBe(1)

      // The second update for each should been registering removal of the relationship
      expect(relationshipsForAFromSubscribe.get(2)?.length).toBe(0)
      expect(relationshipsForBFromSubscribe.get(2)?.length).toBe(0)
      
      // Verify that the onError callback was not called
      expect(onError).not.toHaveBeenCalled()
    })
  })

  describe('blocking relationships', () => {
    it('should allow a decision to be blocked by 2 decisions', async () => {
      // Mark A as blocked by B
      const blockingRelationshipAB = DecisionRelationship.createBlockingRelationship(decisionA, decisionB);
      await repository.addRelationship(blockingRelationshipAB);
      relationshipsToCleanUp.push(blockingRelationshipAB);

      // Mark A as blocked by C
      const blockingRelationshipAC = DecisionRelationship.createBlockingRelationship(decisionA, decisionC);
      await repository.addRelationship(blockingRelationshipAC);
      relationshipsToCleanUp.push(blockingRelationshipAC);
    })

    it('should prevent cyclic blocking relationships', async () => {
      // Create A blocks B
      const blockingRelationshipAB = DecisionRelationship.createBlockingRelationship(decisionA, decisionB);
      await repository.addRelationship(blockingRelationshipAB);
      relationshipsToCleanUp.push(blockingRelationshipAB);

      // Create B blocks C
      const blockingRelationshipBC = DecisionRelationship.createBlockingRelationship(decisionB, decisionC);
      await repository.addRelationship(blockingRelationshipBC);
      relationshipsToCleanUp.push(blockingRelationshipBC);

      // Attempt to create C blocks A (which would create a cycle)
      await expect(repository.addRelationship(DecisionRelationship.createBlockingRelationship(decisionC, decisionA)))
        .rejects
        .toThrow(DecisionRelationshipError);
    })
  })

  describe('superseding relationships', () => {
    it('should prevent superceding an already superceded decision', async () => {
      const supersedingRelationshipBA = DecisionRelationship.createSupersedingRelationship(decisionB, decisionA);
      const supersedingRelationshipBC = DecisionRelationship.createSupersedingRelationship(decisionB, decisionC);
      relationshipsToCleanUp.push(supersedingRelationshipBA);
      relationshipsToCleanUp.push(supersedingRelationshipBC);
     
      // Adding the first superceded relationship for Decision B is fine
      await repository.addRelationship(supersedingRelationshipBA);

      // Attempting to add another superseded relationship for Decision B should fail
      await expect(repository.addRelationship(supersedingRelationshipBC))
        .rejects
        .toThrow(DecisionRelationshipError);
    })

    it('should prevent cyclic superseding relationships', async () => {
      // Create A supersedes B
      const supersedingRelationshipAB = DecisionRelationship.createSupersedingRelationship(decisionA, decisionB);
      await repository.addRelationship(supersedingRelationshipAB);
      relationshipsToCleanUp.push(supersedingRelationshipAB);

      // Create B supersedes C
      const supersedingRelationshipBC = DecisionRelationship.createSupersedingRelationship(decisionB, decisionC);
      await repository.addRelationship(supersedingRelationshipBC);
      relationshipsToCleanUp.push(supersedingRelationshipBC);

      // Attempt to create C supersedes A (which would create a cycle)
      await expect(repository.addRelationship(DecisionRelationship.createSupersedingRelationship(decisionC, decisionA)))
        .rejects
        .toThrow(DecisionRelationshipError);
    })
  })
}) 