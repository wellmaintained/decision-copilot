import { useState, useEffect } from 'react'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'
import { decisionRelationshipRepository } from '@/lib/infrastructure/firestoreDecisionRelationshipRepository'

export function useDecisionRelationships(decisionId: string, organisationId: string) {
  const [relationships, setRelationships] = useState<DecisionRelationship[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!decisionId || !organisationId) {
      setRelationships([])
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    const unsubscribe = decisionRelationshipRepository.subscribeToDecisionRelationships(
      decisionId,
      organisationId,
      (relationships) => {
        setRelationships(relationships)
        setLoading(false)
      },
      (error) => {
        setError(error)
        setLoading(false)
      }
    )

    return () => {
      unsubscribe()
    }
  }, [decisionId, organisationId])

  const addRelationship = async (toDecisionId: string, type: 'blocked_by' | 'supersedes') => {
    try {
      await decisionRelationshipRepository.addRelationship(
        decisionId,
        toDecisionId,
        type,
        organisationId
      )
    } catch (error) {
      setError(error as Error)
      throw error
    }
  }

  const removeRelationship = async (relationshipId: string) => {
    try {
      await decisionRelationshipRepository.removeRelationship(relationshipId, organisationId)
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