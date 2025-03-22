'use client'

import React from 'react';
import { useOrganisation } from '@/components/organisation-switcher';
import { useOrganisationDecisions } from '@/hooks/useOrganisationDecisions';
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, FileText, Users, Clock } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { WorkflowProgress } from '@/components/ui/workflow-progress';
import { Decision, WorkflowNavigator } from '@/lib/domain/Decision';

interface DecisionCardProps {
  decision: Decision;
  showEditButton?: boolean;
  organisationId: string;
}

export default function OrganisationDecisionsList() {
  const params = useParams();
  const organisationId = params.organisationId as string;
  const { selectedOrganisation } = useOrganisation();
  const { decisions, loading, error, deleteDecision } = useOrganisationDecisions(organisationId);

  if (loading) return <div className="p-6">Loading decisions...</div>;
  if (error) return <div className="p-6 text-red-500">Error loading decisions: {error.message}</div>;
  if (!selectedOrganisation) return <p>...</p>;

  const inProgressDecisions = decisions?.filter(d => d.status === 'in_progress') || [];
  const blockedDecisions = decisions?.filter(d => d.status === 'blocked') || [];
  const supersededDecisions = decisions?.filter(d => d.status === 'superseded') || [];
  const publishedDecisions = decisions?.filter(d => d.status === 'published') || [];

  const handleDelete = async (decisionId: string) => {
    try {
      await deleteDecision(decisionId);
      console.log('Decision deleted:', decisionId);
    } catch (error) {
      console.error('Error deleting decision:', error);
    }
  };

  const DecisionCard = ({ decision, showEditButton = true, organisationId }: DecisionCardProps) => {
    return (
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
          {decision.decision && (
            <p className="text-sm text-gray-600 mb-2">
              Decision: {decision.decision}
            </p>
          )}
          <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <WorkflowProgress currentStep={WorkflowNavigator.getStepIndex(decision.currentStep) + 1} />
            </div>
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
          {showEditButton ? (
            <Button variant="ghost" size="icon" title="Edit decision" asChild>
              <Link href={`/organisation/${organisationId}/decision/${decision.id}/edit`}>
                <Pencil className="h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button variant="ghost" size="icon" title="View decision" asChild>
              <Link href={`/organisation/${organisationId}/decision/${decision.id}/view`}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
          )}
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
    );
  };

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6"><span className="text-primary bg-gray-100 rounded-md px-2 py-1">{selectedOrganisation.name}</span>&apos;s Decisions</h1>
      <div className="space-y-8">
        <div>
          <h2 className="text-lg font-medium mb-4">In Progress</h2>
          <div className="space-y-4">
            {inProgressDecisions.map((decision) => (
              <DecisionCard
                key={decision.id}
                decision={decision}
                showEditButton={true}
                organisationId={organisationId}
              />
            ))}
            {inProgressDecisions.length === 0 && (
              <p className="text-gray-500">No in-progress decisions</p>
            )}
          </div>
        </div>

        {blockedDecisions.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Blocked</h2>
            <div className="space-y-4">
              {blockedDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  showEditButton={true}
                  organisationId={organisationId}
                />
              ))}
            </div>
          </div>
        )}

        {publishedDecisions.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Published</h2>
            <div className="space-y-4">
              {publishedDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  showEditButton={false}
                  organisationId={organisationId}
                />
              ))}
            </div>
          </div>
        )}

        {supersededDecisions.length > 0 && (
          <div>
            <h2 className="text-lg font-medium mb-4">Superseded</h2>
            <div className="space-y-4">
              {supersededDecisions.map((decision) => (
                <DecisionCard
                  key={decision.id}
                  decision={decision}
                  showEditButton={false}
                  organisationId={organisationId}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

