import { useState, useEffect } from 'react'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'
import { decisionRelationshipsRepository } from '@/lib/repositories/DecisionRelationshipsRepository'

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

    const unsubscribe = decisionRelationshipsRepository.subscribeToDecisionRelationships(
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
      await decisionRelationshipsRepository.addRelationship(
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
      await decisionRelationshipsRepository.removeRelationship(relationshipId, organisationId)
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