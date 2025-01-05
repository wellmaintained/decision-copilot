'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid'
import { Decision } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'

export default function DecisionPage() {
  const router = useRouter()
  const { createDecision } = useDecisions()

  useEffect(() => {
    const createAndRedirect = async () => {
      const decisionId = uuidv4()
      const newDecision = Decision.create({
        id: decisionId,
        title: '',
        cost: 'medium',
        createdAt: new Date(),
        criteria: [],
        options: [],
        reversibility: 'haircut',
        stakeholders: [],
        status: 'draft',
        user: 'current-user', // TODO: Get from auth context
      })

      await createDecision(newDecision)
      router.push(`/dashboard/decision/${decisionId}/identify`)
    }

    createAndRedirect()
  }, [router, createDecision])

  return null // This page immediately redirects
} 