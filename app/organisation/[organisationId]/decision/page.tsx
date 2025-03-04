'use client'

import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useProjectDecisions } from '@/hooks/useProjectDecisions'
import { Card } from '@/components/ui/card'
import { PlusCircle } from 'lucide-react'
import { useParams } from 'next/navigation'

export default function DecisionsPage() {
  const { decisions } = useProjectDecisions()
  const params = useParams()

  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Decisions</h1>
        <Button asChild>
          <Link href={`/organisation/${params.organisationId}/team/${params.teamId}/project/${params.projectId}/decision/create`}>
            <PlusCircle className="mr-2 h-4 w-4" />
            New Decision
          </Link>
        </Button>
      </div>

      <div className="grid gap-4">
        {decisions?.map((decision) => (
          <Card key={decision.id} className="p-4">
            <Link href={`/organisation/${params.organisationId}/team/${params.teamId}/project/${params.projectId}/decision/${decision.id}/identify`} className="block">
              <h2 className="text-xl font-semibold mb-2">{decision.title || 'Untitled Decision'}</h2>
              <p className="text-muted-foreground">{decision.description || 'No description'}</p>
              <div className="flex gap-2 mt-2">
                <span className="text-sm text-muted-foreground">Status: {decision.status}</span>
                <span className="text-sm text-muted-foreground">Cost: {decision.cost}</span>
                <span className="text-sm text-muted-foreground">Reversibility: {decision.reversibility}</span>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    </div>
  )
} 