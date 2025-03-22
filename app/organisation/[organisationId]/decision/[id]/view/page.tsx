'use client'

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useDecision } from '@/hooks/useDecisions'
import { useStakeholders } from '@/hooks/useStakeholders'
import { SupportingMaterialIcon } from '@/components/supporting-material-icon'
import { StakeholderRole } from '@/lib/domain/Decision'

function StakeholderGroup({ title, stakeholders }: { title: string, stakeholders: { id: string, displayName: string, photoURL?: string }[] }) {
  return (
    <div className="flex-1">
      <h3 className="text-lg font-semibold text-slate-700 mb-4">{title}</h3>
      <div className="space-y-3">
        {stakeholders.map((stakeholder) => (
          <div key={`stakeholder-${stakeholder.id}`} className="flex items-center gap-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={stakeholder.photoURL} alt={stakeholder.displayName} />
              <AvatarFallback>{stakeholder.displayName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-slate-600">{stakeholder.displayName}</span>
          </div>
        ))}
      </div>
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

  const deciderStakeholders = stakeholders?.filter(s => 
    decision.stakeholders.find(ds => ds.stakeholder_id === s.id && ds.role === ('decider' as StakeholderRole))
  ) || []
  const consultedStakeholders = stakeholders?.filter(s => 
    decision.stakeholders.find(ds => ds.stakeholder_id === s.id && ds.role === ('consulted' as StakeholderRole))
  ) || []
  const informedStakeholders = stakeholders?.filter(s => 
    decision.stakeholders.find(ds => ds.stakeholder_id === s.id && ds.role === ('informed' as StakeholderRole))
  ) || []

  return (
    <>
      <div className="space-y-8">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-slate-900">{decision.title || 'Untitled Decision'}</h1>
          <p className="text-slate-600">{decision.description}</p>
        </div>

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-800">Decision</h2>
          <p className="text-slate-600">{decision.decision || 'No decision made yet'}</p>
        </section>

        {decision.options.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Options considered</h2>
            <ol className="list-decimal list-inside space-y-2">
              {decision.options.map((option, index) => (
                <li key={`option-${index}`} className="text-slate-600">{option}</li>
              ))}
            </ol>
          </section>
        )}

        {decision.criteria.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Criteria</h2>
            <ol className="list-decimal list-inside space-y-2">
              {decision.criteria.map((criterion, index) => (
                <li key={`criterion-${index}`} className="text-slate-600">{criterion}</li>
              ))}
            </ol>
          </section>
        )}

        {decision.supportingMaterials.length > 0 && (
          <section className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">Supporting Materials</h2>
            <div className="space-y-2">
              {decision.supportingMaterials.map((material, index) => (
                <div key={`material-${index}`} className="flex items-center gap-2 text-slate-600">
                  <SupportingMaterialIcon mimeType={material.mimeType} />
                  <a 
                    href={material.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="hover:underline"
                  >
                    {material.title}
                  </a>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="space-y-2">
          <h2 className="text-xl font-semibold text-slate-800">Method</h2>
          <p className="text-slate-600">{decision.decisionMethod || 'No method selected'}</p>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-semibold text-slate-800">Stakeholders</h2>
          <div className="grid md:grid-cols-3 gap-8">
            {deciderStakeholders.length > 0 && (
              <StakeholderGroup 
                title="Deciders" 
                stakeholders={deciderStakeholders} 
              />
            )}
            {consultedStakeholders.length > 0 && (
              <StakeholderGroup 
                title="Consulted" 
                stakeholders={consultedStakeholders} 
              />
            )}
            {informedStakeholders.length > 0 && (
              <StakeholderGroup 
                title="Informed" 
                stakeholders={informedStakeholders} 
              />
            )}
          </div>
        </section>

        {decision.status === 'published' && (
          <div className="bottom-0 right-0 bg-sky-100 p-4 flex items-center justify-between z-50">
            <p className="text-slate-700">This decision has been published and can no longer be edited</p>
            <Button variant="default" className="bg-blue-600 hover:bg-blue-700">
              <Link href={`/organisation/${organisationId}/decision/${decisionId}/edit`}>
                Un-publish
              </Link>
            </Button>
          </div>
        )}

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

