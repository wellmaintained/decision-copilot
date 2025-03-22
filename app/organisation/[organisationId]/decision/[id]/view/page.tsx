'use client'

import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDecision } from '@/hooks/useDecisions'
import { useStakeholders } from '@/hooks/useStakeholders'
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
  const { decision, isLoading } = useDecision(params.id as string)
  const { stakeholders } = useStakeholders(params.organisationId as string)

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (!decision) {
    return <div>Decision not found</div>
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-900">{decision.title}</h1>
        <Button asChild>
          <Link href={`/organisation/${params.organisationId}/decision/${params.id}/edit`}>
            Edit
          </Link>
        </Button>
      </div>

      {decision.publishedAt && <PublishedBanner />}

      <DecisionSection title="Summary">
        <DecisionSummary decision={decision} stakeholders={stakeholders} />
      </DecisionSection>
    </div>
  )
}

