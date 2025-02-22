import { useState } from 'react'
import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'
import { FirestoreDecisionRelationshipRepository } from '@/lib/infrastructure/firestoreDecisionRelationshipRepository'
import { Decision } from '@/lib/domain/Decision'

const decisionRelationshipRepository = new FirestoreDecisionRelationshipRepository();

export interface SelectedDecisionDetails {
  toDecisionId: string
  toTeamId: string
  toProjectId: string
  organisationId: string
}

export function useDecisionRelationships(fromDecision: Decision) {
  const [error, setError] = useState<Error | null>(null)

  const addRelationship = async (toDecision: SelectedDecisionDetails, type: DecisionRelationshipType) => {
    try {
      const relationship = DecisionRelationship.create({
        fromDecisionId: fromDecision.id,
        toDecisionId: toDecision.toDecisionId,
        type,
        createdAt: new Date(),
        fromTeamId: fromDecision.teamId,
        fromProjectId: fromDecision.projectId,
        toTeamId: toDecision.toTeamId,
        toProjectId: toDecision.toProjectId,
        organisationId: fromDecision.organisationId
      });

      await decisionRelationshipRepository.addRelationship(relationship)
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }

  const removeRelationship = async (relationship: DecisionRelationship) => {
    try {
      await decisionRelationshipRepository.removeRelationship(relationship)
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }

  return {
    error,
    addRelationship,
    removeRelationship
  }
} 