import EditDecisionClient from './EditDecisionClient'

type Params = Promise<{
  organisationId: string
  id: string
}>

export default async function EditDecisionPage({ params }: { params: Params }) {
  const { organisationId, id } = await params
  
  return (
    <EditDecisionClient
      organisationId={organisationId}
      id={id}
    />
  )
} 