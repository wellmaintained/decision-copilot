import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card"
import { Decision } from "@/lib/domain/Decision"
import { Stakeholder } from "@/lib/domain/Stakeholder"
import { StakeholderRoleGroups } from "@/components/stakeholders/StakeholderRoleGroups"
import ReactMarkdown from 'react-markdown'

interface DecisionSummaryProps {
  decision: Decision
  stakeholders?: Stakeholder[]
  compact?: boolean
}

export function DecisionSummary({ 
  decision, 
  stakeholders,
  compact = false,
}: DecisionSummaryProps) {
  const supersedesRelationship = decision.getRelationshipsByType('supersedes')[0];
  const supersededByRelationship = decision.getRelationshipsByType('superseded_by')[0];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Decision: {decision.title}</CardTitle>
        {supersedesRelationship && (
          <CardDescription>
            supersedes <em>{supersedesRelationship.targetDecisionTitle}</em>
          </CardDescription>
        )}
        {supersededByRelationship && (
          <CardDescription>
            superseded by <em>{supersededByRelationship.targetDecisionTitle}</em>
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <h3 className="text-muted-foreground">Description</h3>
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{decision.description || ''}</ReactMarkdown>
          </div>
        </div>

        {!compact && (
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-muted-foreground">Cost</h3>
              <p className="capitalize">{decision.cost}</p>
            </div>
            <div className="space-y-2">
              <h3 className="text-muted-foreground">Reversibility</h3>
              <p className="capitalize">{decision.reversibility}</p>
            </div>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-muted-foreground">Decision</h3>
          <div className="rounded-md bg-muted p-4 prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown>{decision.decision || "No decision recorded"}</ReactMarkdown>
          </div>
        </div>

        {!compact && decision.supportingMaterials && decision.supportingMaterials.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-muted-foreground">Supporting Materials</h3>
            <ul className="list-disc pl-4">
              {decision.supportingMaterials.map((material, index) => (
                <li key={index}>
                  <a href={material.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    {material.title || material.url}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="space-y-2">
          <h3 className="text-muted-foreground">Method</h3>
          <p className="capitalize">
            {decision.decisionMethod?.replace('_', ' ') || "No method selected"}
          </p>
        </div>

        {stakeholders && (
          <div className="space-y-2">
            <h3 className="text-muted-foreground">Stakeholders</h3>
            <StakeholderRoleGroups 
              decision={decision} 
              stakeholders={stakeholders}
            />
          </div>
        )}

        {!compact && (
          <div className="grid grid-cols-2 gap-4 pt-4 border-t">
            <div className="space-y-2">
              <h3 className="text-muted-foreground">Created</h3>
              <p className="text-sm text-muted-foreground">
                {decision.createdAt.toLocaleDateString()}
              </p>
            </div>
            <div className="space-y-2">
              <h3 className="text-muted-foreground">Published</h3>
              <p className="text-sm text-muted-foreground">
                {decision.publishDate ? decision.publishDate.toLocaleDateString() : 'Not published'}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 