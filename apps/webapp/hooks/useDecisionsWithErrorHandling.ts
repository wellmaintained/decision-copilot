import { db } from "@/lib/env";
import { useState, useEffect, useCallback } from "react";
import {
  Decision,
  Cost,
  Reversibility,
  DecisionStakeholderRole,
  DecisionMethod,
} from "@decision-copilot/domain/Decision";
import { SupportingMaterial } from "@decision-copilot/domain/SupportingMaterial";
import { FirestoreDecisionsRepository } from "@decision-copilot/infrastructure";
import { DecisionScope } from "@decision-copilot/domain/decisionsRepository";
import { useErrorHandling, useAsyncOperation } from './useErrorHandling';
import { useErrorReporting } from '@/components/error/ErrorProvider';

const decisionsRepository = new FirestoreDecisionsRepository(db);

export function useDecisionWithErrorHandling(decisionId: string, organisationId: string) {
  const [decision, setDecision] = useState<Decision | null>(null);
  const [loading, setLoading] = useState(true);
  const { errorState, handleError, clearError } = useErrorHandling();
  const { reportError } = useErrorReporting();

  useEffect(() => {
    let unsubscribe: () => void;
    
    const fetchDecision = async () => {
      try {
        clearError();
        const scope: DecisionScope = { organisationId };
        const fetchedDecision = await decisionsRepository.getById(decisionId, scope);
        
        unsubscribe = decisionsRepository.subscribeToOne(
          fetchedDecision,
          (decision: Decision | null) => {
            setDecision(decision);
            setLoading(false);
          },
          (error: Error) => {
            handleError(error, "Failed to load decision updates");
            setLoading(false);
          },
        );
      } catch (err) {
        const error = err as Error;
        handleError(error, "Failed to load decision");
        reportError(error, 'useDecisionWithErrorHandling');
        setLoading(false);
      }
    };

    fetchDecision();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [decisionId, organisationId, handleError, clearError, reportError]);

  // Enhanced update functions with proper error handling
  const { execute: executeUpdate } = useAsyncOperation<void>();

  const updateDecisionTitle = useCallback(async (title: string) => {
    if (!decision) {
      throw new Error('No decision loaded to update');
    }
    
    return executeUpdate(
      () => decisionsRepository.update(decision.with({ title })),
      'Failed to update decision title'
    );
  }, [decision, executeUpdate]);

  const updateDecisionDescription = useCallback(async (description: string) => {
    if (!decision) {
      throw new Error('No decision loaded to update');
    }
    
    return executeUpdate(
      () => decisionsRepository.update(decision.with({ description })),
      'Failed to update decision description'
    );
  }, [decision, executeUpdate]);

  const updateDecisionCost = useCallback(async (cost: Cost) => {
    if (!decision) {
      throw new Error('No decision loaded to update');
    }
    
    return executeUpdate(
      () => decisionsRepository.update(decision.with({ cost })),
      'Failed to update decision cost'
    );
  }, [decision, executeUpdate]);

  const updateDecisionReversibility = useCallback(async (reversibility: Reversibility) => {
    if (!decision) {
      throw new Error('No decision loaded to update');
    }
    
    return executeUpdate(
      () => decisionsRepository.update(decision.with({ reversibility })),
      'Failed to update decision reversibility'
    );
  }, [decision, executeUpdate]);

  const publishDecision = useCallback(async () => {
    if (!decision) {
      throw new Error('No decision loaded to publish');
    }
    
    await executeUpdate(
      async () => {
        await decisionsRepository.publishDecision(decision.id, { organisationId });
      },
      'Failed to publish decision'
    );
  }, [decision, organisationId, executeUpdate]);

  // Note: Simplified implementation - add more repository methods as needed
  // based on actual FirestoreDecisionsRepository interface

  return {
    decision,
    loading,
    error: errorState.error,
    isError: errorState.isError,
    errorMessage: errorState.message,
    clearError,
    
    // Update operations
    updateDecisionTitle,
    updateDecisionDescription,
    updateDecisionCost,
    updateDecisionReversibility,
    publishDecision,
  };
}

// Hook for decisions list with error handling
export function useDecisionsListWithErrorHandling(scope: DecisionScope) {
  const [decisions, setDecisions] = useState<Decision[]>([]);
  const [loading, setLoading] = useState(true);
  const { errorState, handleError, clearError } = useErrorHandling();
  const { reportError } = useErrorReporting();

  useEffect(() => {
    let unsubscribe: () => void;
    
    const fetchDecisions = async () => {
      try {
        clearError();
        setLoading(true);
        
        unsubscribe = decisionsRepository.subscribeToAll(
          (decisions: Decision[]) => {
            setDecisions(decisions);
            setLoading(false);
          },
          (error: Error) => {
            handleError(error, "Failed to load decisions");
            reportError(error, 'useDecisionsListWithErrorHandling');
            setLoading(false);
          },
          scope,
        );
      } catch (err) {
        const error = err as Error;
        handleError(error, "Failed to load decisions");
        reportError(error, 'useDecisionsListWithErrorHandling');
        setLoading(false);
      }
    };

    fetchDecisions();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [scope.organisationId, handleError, clearError, reportError]);

  // Note: createDecision method removed for now - add when repository interface is clarified

  return {
    decisions,
    loading,
    error: errorState.error,
    isError: errorState.isError,
    errorMessage: errorState.message,
    clearError,
  };
}