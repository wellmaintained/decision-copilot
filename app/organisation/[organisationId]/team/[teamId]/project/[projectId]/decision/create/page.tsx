'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { DecisionProps } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'
import { useAuth } from '@/hooks/useAuth'
import { Cost, Reversibility } from '@/lib/domain/Decision'

export default function DecisionPage() {
  const router = useRouter()
  const { createDecision } = useDecisions()
  const { user } = useAuth()
  const hasCreatedDecision = useRef(false)

  useEffect(() => {
    if (!hasCreatedDecision.current && user) {
      hasCreatedDecision.current = true;
      createDecision({
        title: '',
        description: '',
        cost: 'low' as const,
        reversibility: 'hat' as const,
        stakeholders: [],
        status: 'draft',
        user: user.uid,
        createdAt: new Date(),
        criteria: [],
        options: [],
      }).then((decision) => {
        router.push(`${decision.id}/identify`)
      })
    }
  }, [user, createDecision, router])

  return <div>Creating decision...</div>
} 