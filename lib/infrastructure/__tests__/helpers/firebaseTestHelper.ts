import { DecisionScope } from '@/lib/domain/decisionsRepository'
import { auth } from '@/lib/firebase'
import { signInWithEmailAndPassword } from 'firebase/auth'

// Test user credentials - these will work with the Firebase Auth Emulator
const TEST_EMAIL = 'integration-test-user@example.com'
const TEST_PASSWORD = 'password123'
export const TEST_SCOPE: DecisionScope = {
  organisationId: '9HY1YTkOdqxOTFOMZe8r', // Org 1
  teamId: 'f0JwCXSslD9qDXSPMvWS', // Org 1 / Everyone
  projectId: 'integration-test-project-id' // IntegrationTestProject
} 

export async function signInTestUser() {
  try {
    await signInWithEmailAndPassword(auth, TEST_EMAIL, TEST_PASSWORD)
  } catch (error) {
    console.error('Failed to sign in test user:', error)
    throw error
  }
}
