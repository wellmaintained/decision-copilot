// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { FirestoreStakeholdersRepository } from "@/lib/infrastructure/firestoreStakeholdersRepository";

/**
 * Keeps track of the current Firebase Auth user and manages admin session
 */
export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const stakeholderRepository = new FirestoreStakeholdersRepository();

      if (firebaseUser) {
        await stakeholderRepository.updateStakeholderForUser(firebaseUser);
        try {
          // Get the current token
          const idToken = await firebaseUser.getIdToken();
          
          // Create session cookie
          await fetch('/api/auth/session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          // Check admin status
          const response = await fetch('/api/auth/check-admin', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          });

          if (response.ok) {
            const result = await response.json();
            setIsAdmin(result.isAdmin === true);
          } else {
            console.error('Failed to check admin status:', await response.text());
            setIsAdmin(false);
          }
        } catch (error) {
          console.error('Error checking admin status:', error);
          setIsAdmin(false);
        }
      } else {
        setIsAdmin(false);
        // Clear session cookie on sign out
        await fetch('/api/auth/session', {
          method: 'DELETE',
        });
      }

      setUser(firebaseUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { user, loading, isAdmin };
}
