// hooks/useAuth.ts
import { useState, useEffect } from "react";
import { User, onAuthStateChanged } from "firebase/auth";
import { auth, functions } from "@/lib/firebase";
import { FirestoreStakeholdersRepository } from "@/lib/infrastructure/firestoreStakeholdersRepository";
import { httpsCallable } from "firebase/functions";

/**
 * Single Responsibility: keeps track of the current Firebase Auth user
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
        // Call the setAdminClaim function and get the token
        const setAdminClaimFn = httpsCallable(functions, "setAdminClaim");
        await setAdminClaimFn();
        // Force token refresh to get latest claims
        await firebaseUser.getIdToken(true);
        // Get the claims
        const token = await firebaseUser.getIdTokenResult();
        setIsAdmin(token.claims.admin === true);
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
