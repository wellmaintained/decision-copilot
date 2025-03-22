'use client'

import { useParams } from 'next/navigation'
import { useDecision } from '@/hooks/useDecisions'
import { useStakeholders } from '@/hooks/useStakeholders'
import { DecisionSummary } from '@/components/decision-summary'
import Link from 'next/link'

function PublishedBanner() {
  return (
    <div className="bg-sky-100 p-4 rounded-md">
      <p className="text-slate-700">This decision has been published and can no longer be edited</p>
    </div>
  )
}

function SupersededBanner({ supersedingDecisionId, supersedingDecisionTitle, organisationId }: { 
  supersedingDecisionId: string
  supersedingDecisionTitle: string
  organisationId: string 
}) {
  return (
    <div className="bg-amber-100 p-4 rounded-md">
      <p className="text-slate-700">
        This decision has been superseded by{' '}
        <Link 
          href={`/organisation/${organisationId}/decision/${supersedingDecisionId}/view`}
          className="text-amber-800 hover:text-amber-900 underline"
        >
          {supersedingDecisionTitle}
        </Link>
      </p>
    </div>
  )
}

export default function DecisionView() {
  const params = useParams()
  const { decision, loading } = useDecision(params.id as string, params.organisationId as string)
  const { stakeholders } = useStakeholders()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!decision) {
    return <div>Decision not found</div>
  }

  const supersededByRelationship = decision.getSupersededByRelationship()

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-slate-900">{decision.title}</h1>

      <DecisionSummary 
        decision={decision}
        stakeholders={stakeholders}
      />

      {decision.isPublished() && <PublishedBanner />}
      {supersededByRelationship && (
        <SupersededBanner 
          supersedingDecisionId={supersededByRelationship.targetDecision.id}
          supersedingDecisionTitle={supersededByRelationship.targetDecisionTitle}
          organisationId={params.organisationId as string}
        />
      )}
    </div>
  )
}

