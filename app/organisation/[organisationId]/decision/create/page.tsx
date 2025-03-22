'use client'

import { useEffect, useRef } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useOrganisationDecisions } from '@/hooks/useOrganisationDecisions'
import { useAuth } from '@/hooks/useAuth'

export default function DecisionPage() {
  const router = useRouter()
  const params = useParams()
  const organisationId = params.organisationId as string
  const { createDecision } = useOrganisationDecisions(organisationId)
  const { user } = useAuth()
  const hasCreatedDecision = useRef(false)

  useEffect(() => {
    if (user) { // we need to wait until the logged in user is available
      if (!hasCreatedDecision.current) { // we only want to run createDecision once
        hasCreatedDecision.current = true;
        createDecision().then((decision) => {
          router.push(`${decision.id}/edit`)
        })
      }
    }
  }, [user, createDecision, router])

  return <div>Creating decision...</div>
} 