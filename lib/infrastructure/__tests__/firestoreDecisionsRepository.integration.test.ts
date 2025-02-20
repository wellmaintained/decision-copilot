import { describe, it, expect, beforeEach, afterEach, afterAll, beforeAll, vi } from 'vitest'
import { FirestoreDecisionsRepository } from '@/lib/infrastructure/firestoreDecisionsRepository'
import { Decision } from '@/lib/domain/Decision'
import { TEST_SCOPE, signInTestUser } from './helpers/firebaseTestHelper'
import { doc, setDoc, deleteDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'

describe('FirestoreDecisionsRepository Integration Tests', () => {
  const repository = new FirestoreDecisionsRepository()
  let sampleDecision: Decision;

  beforeAll(async () => {
    await signInTestUser()
    const emptyDecision = Decision.createEmptyDecision(TEST_SCOPE);
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
    await repository.delete(sampleDecision.id, TEST_SCOPE);
  })

  describe('subscribeToOne', () => {
    it('should receive updates when a decision is modified', async () => {
      const decisionId = sampleDecision.id;
      const decisionsFromSubscribeToOne: (Decision | null)[] = []
      const onError = vi.fn()
      
      // Create a promise that resolves when we get both the initial and updated decision
      const receivedUpdatesPromise = new Promise<void>((resolve) => {
        const checkUpdates = () => {
          if (decisionsFromSubscribeToOne.length === 2) {
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToOne(
          decisionId,
          (decision) => {
            console.log('Received decision update:', decision?.title ?? 'null')
            decisionsFromSubscribeToOne.push(decision)
            checkUpdates();
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
      await receivedUpdatesPromise;

      // Verify results
      expect(decisionsFromSubscribeToOne.length).toBe(2)
      expect(decisionsFromSubscribeToOne[0]?.title).toBe('Sample Decision')
      expect(decisionsFromSubscribeToOne[1]?.title).toBe('Sample Decision [UPDATED]')
      expect(onError).not.toHaveBeenCalled()
    })
  })
})
