// hooks/useAuth.ts
import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '@/lib/env';
import { stakeholdersRepository } from '@/lib/repositories';

// List of admin emails
const ADMIN_EMAILS = [
  'mrdavidlaing@gmail.com',
  'david@mechanical-orchard.com',
  // Add more admin emails as needed
];

/**
 * Single Responsibility: keeps track of the current Firebase Auth user
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        await stakeholdersRepository.updateStakeholderForUser(firebaseUser);
        
        // Check if the user is an admin
        const isUserAdmin = firebaseUser.email ? ADMIN_EMAILS.includes(firebaseUser.email) : false;
        setIsAdmin(isUserAdmin);
      } else {
        setIsAdmin(false);
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin };
}