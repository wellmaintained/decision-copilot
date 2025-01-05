'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { DecisionProps } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'
import { useAuth } from '@/hooks/useAuth'

export default function DecisionPage() {
  const router = useRouter()
  const { createDecision } = useDecisions()
  const { user } = useAuth()

  useEffect(() => {
    const createAndRedirect = async () => {
      const decisionId = await createDecision({
        title: '',
        description: '',
        cost: 'medium',
        createdAt: new Date(),
        criteria: [],
        options: [],
        reversibility: 'haircut',
        stakeholders: [],
        status: 'draft',
        user: user?.uid || '',
      } satisfies Omit<DecisionProps, 'id'>)

      // Force a full page reload
      window.location.href = `/dashboard/decision/${decisionId}/identify`;
    }

    createAndRedirect()
  }, [router, createDecision, user])

  return <div>Creating decision...</div>
} 