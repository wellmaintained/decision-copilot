'use client'

import { useProjectDecisions } from '@/hooks/useProjectDecisions';
import { Button } from "@/components/ui/button"
import { Pencil, Trash2, FileText, Users, Clock } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation';

export default function ProjectDecisionsPage() {
  const params = useParams();
  const { decisions, loading, error, deleteDecision } = useProjectDecisions();

  if (loading) {
    return <div className="p-6">Loading decisions...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-500">Error loading decisions: {error.message}</div>;
  }

  const inProgressDecisions = decisions?.filter(d => d.status === 'draft') || [];
  const publishedDecisions = decisions?.filter(d => d.status === 'published') || [];

  const handleDelete = async (decisionId: string) => {
    try {
      await deleteDecision(decisionId);
      console.log('Decision deleted:', decisionId);
    } catch (error) {
      console.error('Error deleting decision:', error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Button className="bg-blue-500 hover:bg-blue-600" asChild>
          <Link href={`/organisation/${params.organisationId}/team/${params.teamId}/project/${params.projectId}/decision/create`}>
            🌟 Start new decision
          </Link>
        </Button>
      </div>

      <div className="space-y-6">
        <div>
          <h2 className="text-lg font-medium mb-4">In progress</h2>
          <div className="space-y-4">
            {inProgressDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-white"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{decision.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {decision.cost}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    {decision.description}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{decision.stakeholders.length} stakeholders</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {decision.updatedAt?.toLocaleDateString() || decision.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" title="Edit decision">
                    <Link href={`/organisation/${params.organisationId}/team/${params.teamId}/project/${params.projectId}/decision/${decision.id}/identify`}>
                      <Pencil className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete decision"
                    onClick={() => handleDelete(decision.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-lg font-medium mb-4">Published</h2>
          <div className="space-y-4">
            {publishedDecisions.map((decision) => (
              <div
                key={decision.id}
                className="flex items-start justify-between p-4 rounded-lg border bg-white"
              >
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-medium text-gray-900">{decision.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700">
                      {decision.cost}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Decision: {decision.decision}
                  </p>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      <span>{decision.stakeholders.length} stakeholders</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      <span>Updated {decision.updatedAt?.toLocaleDateString() || decision.createdAt.toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon" title="View decision">
                    <Link href={`/organisation/${params.organisationId}/team/${params.teamId}/project/${params.projectId}/decision/${decision.id}/view`}>
                      <FileText className="h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Delete decision"
                    onClick={() => handleDelete(decision.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

