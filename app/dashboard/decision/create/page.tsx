'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import type { DecisionProps } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'
import { useAuth } from '@/hooks/useAuth'

export default function DecisionPage() {
  const router = useRouter()
  const { createDecision } = useDecisions()
  const { user } = useAuth()
  const hasCreatedDecision = useRef(false)

  useEffect(() => {
    const createAndRedirect = async () => {
      if (hasCreatedDecision.current) {
        console.log('Decision already created');
        return;
      }

      hasCreatedDecision.current = true

      const decision = await createDecision();

      // Force a full page reload
      window.location.href = `/dashboard/decision/${decision.id}/identify`;
    }

    createAndRedirect()
  }, [router, createDecision, user])

  return <div>Creating decision...</div>
} 