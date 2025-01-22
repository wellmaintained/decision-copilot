// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { FirestoreStakeholdersRepository } from '@/lib/infrastructure/firestoreStakeholdersRepository';

/**
 * Single Responsibility: keeps track of the current Firebase Auth user
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const stakeholderRepository = new FirestoreStakeholdersRepository();

      if (firebaseUser) {
        await stakeholderRepository.updateStakeholderForUser(firebaseUser);
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading };
}