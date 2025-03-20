import { use } from 'react'
import EditDecisionClient from './EditDecisionClient'

interface EditDecisionPageProps {
  params: {
    organisationId: string
    id: string
  }
}

export default function EditDecisionPage({ params }: EditDecisionPageProps) {
  const resolvedParams = use(Promise.resolve(params))

  return (
    <EditDecisionClient
      organisationId={resolvedParams.organisationId}
      id={resolvedParams.id}
    />
  )
} 