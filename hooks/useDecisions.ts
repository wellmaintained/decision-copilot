import { useState, useEffect } from "react";
import {
  Decision,
  Cost,
  Reversibility,
  DecisionStakeholderRole,
  DecisionMethod,
} from "@/lib/domain/Decision";
import { SupportingMaterial } from "@/lib/domain/SupportingMaterial";
import { FirestoreDecisionsRepository } from "@/lib/infrastructure/firestoreDecisionsRepository";
import { DecisionScope } from "@/lib/domain/decisionsRepository";

const decisionsRepository = new FirestoreDecisionsRepository();

export function useDecision(decisionId: string, organisationId: string) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let unsubscribe: () => void;
    const fetchDecision = async () => {
      try {
        // First get the decision by ID to ensure we have a valid Decision object
        const scope: DecisionScope = { organisationId };
        const fetchedDecision = await decisionsRepository.getById(
          decisionId,
          scope,
        );
        // Then subscribe to updates
        unsubscribe = decisionsRepository.subscribeToOne(
          fetchedDecision,
          (decision: Decision | null) => {
            setDecision(decision);
            setLoading(false);
            setError(null);
          },
          (error: Error) => {
            setError(error);
            setLoading(false);
          },
        );
      } catch (err) {
        setError(err as Error);
        setLoading(false);
      }
    };

    fetchDecision();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [decisionId, organisationId]);

  const updateDecisionTitle = async (title: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ title }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDescription = async (description: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ description }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionCost = async (cost: Cost) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ cost }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionReversibility = async (reversibility: Reversibility) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ reversibility }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionDriver = async (driverStakeholderId: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.setDecisionDriver(driverStakeholderId),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateStakeholders = async (
    stakeholders: DecisionStakeholderRole[],
  ) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ stakeholders }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const addStakeholder = async (
    stakeholderId: string,
    role: DecisionStakeholderRole["role"] = "informed",
  ) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.addStakeholder(stakeholderId, role),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const removeStakeholder = async (stakeholderId: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.removeStakeholder(stakeholderId),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionMethod = async (method: DecisionMethod) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ decisionMethod: method }),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateDecisionContent = async (content: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ decision: content }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const updateSupportingMaterials = async (materials: SupportingMaterial[]) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(
        decision.with({ supportingMaterials: materials }),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const addSupportingMaterial = async (material: SupportingMaterial) => {
    try {
      if (!decision) return;
      const newMaterials = [...(decision.supportingMaterials || []), material];
      await decisionsRepository.update(
        decision.with({ supportingMaterials: newMaterials }),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const removeSupportingMaterial = async (materialUrl: string) => {
    try {
      if (!decision) return;
      const newMaterials = decision.supportingMaterials.filter(
        (m) => m.url !== materialUrl,
      );
      await decisionsRepository.update(
        decision.with({ supportingMaterials: newMaterials }),
      );
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  const publishDecision = async () => {
    try {
      if (!decision) return;
      await decisionsRepository.publishDecision(decision.id, {
        organisationId,
      });
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  /**
   * Updates the notes associated with a decision
   * @param decisionNotes - The new notes content in HTML format
   * @throws {Error} If the update fails or if no decision is loaded
   */
  const updateDecisionNotes = async (decisionNotes: string) => {
    try {
      if (!decision) return;
      await decisionsRepository.update(decision.with({ decisionNotes }));
    } catch (error) {
      setError(error as Error);
      throw error;
    }
  };

  return {
    decision,
    loading,
    error,
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    updateDecisionDriver,
    updateStakeholders,
    updateDecisionMethod,
    addStakeholder,
    removeStakeholder,
    updateDecisionContent,
    updateSupportingMaterials,
    addSupportingMaterial,
    removeSupportingMaterial,
    publishDecision,
    updateDecisionNotes,
  };
}
