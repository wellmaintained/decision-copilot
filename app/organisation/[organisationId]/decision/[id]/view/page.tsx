'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDecision } from '@/hooks/useDecisions'
import { useStakeholders } from '@/hooks/useStakeholders'
import { SupportingMaterialIcon } from '@/components/supporting-material-icon'
import { DecisionSummary } from '@/components/decision-summary'

interface DecisionSectionProps {
  title: string
  children: React.ReactNode
}

function DecisionSection({ title, children }: DecisionSectionProps) {
  return (
    <section className="space-y-4">
      <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
      {children}
    </section>
  )
}

function PublishedBanner() {
  return (
    <div className="bottom-0 right-0 bg-sky-100 p-4 flex items-center justify-between z-50">
      <p className="text-slate-700">This decision has been published and can no longer be edited</p>
    </div>
  )
}

export default function DecisionView() {
  const params = useParams()
  const decisionId = params.id as string
  const organisationId = params.organisationId as string

  const { decision, loading, error } = useDecision(decisionId, organisationId)
  const { stakeholders } = useStakeholders()

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error.message}</div>
  }

  if (!decision) {
    return <div>Decision not found</div>
  }

  return (
    <>
      <div className="space-y-8">
        <DecisionSummary 
          decision={decision}
          stakeholders={stakeholders}
        />

        {decision.status === 'published' && <PublishedBanner />}

        <div className="flex justify-between items-center mb-8">
          <Button variant="outline" asChild>
            <Link href={`/organisation/${organisationId}`}>
              Back to Decisions
            </Link>
          </Button>
        </div>
      </div>
    </>
  )
}

