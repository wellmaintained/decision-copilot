'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useDecisions } from '@/hooks/useDecisions'
import { useAuth } from '@/hooks/useAuth'

export default function DecisionPage() {
  const router = useRouter()
  const { createDecision } = useDecisions()
  const { user } = useAuth()
  const hasCreatedDecision = useRef(false)

  useEffect(() => {
    if (user) { // we need to wait until the logged in user is available
      if (!hasCreatedDecision.current) { // we only want to run createDecision once
        hasCreatedDecision.current = true;
        createDecision().then((decision) => {
          router.push(`${decision.id}/identify`)
        })
      }
    }
  }, [user, createDecision, router])

  return <div>Creating decision...</div>
} 