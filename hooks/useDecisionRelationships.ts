import { useState, useEffect } from 'react'
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
  const [relationships, setRelationships] = useState<DecisionRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!fromDecision) {
      setRelationships([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = decisionRelationshipRepository.subscribeToDecisionRelationships(
      fromDecision,
      (relationships: DecisionRelationship[]) => {
        setRelationships(relationships)
        setLoading(false)
      },
      (error: Error) => {
        setError(error)
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [fromDecision])

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
    relationships,
    loading,
    error,
    addRelationship,
    removeRelationship
  }
} 