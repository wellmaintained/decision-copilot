import { Button } from '@/components/ui/button'
import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'
import { X, Plus } from 'lucide-react'
import { AddDecisionRelationshipDialog } from '@/components/add-decision-relationship-dialog'

interface DecisionRelationshipItemProps {
  relationship: DecisionRelationship
  onRemove: (relationshipId: string) => Promise<void>
  relatedDecisionTitle: string
}

function DecisionRelationshipItem({ relationship, onRemove, relatedDecisionTitle }: DecisionRelationshipItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded-md group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm text-muted-foreground capitalize">{relationship.type}:</span>
        <span className="text-sm truncate">{relatedDecisionTitle}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(relationship.id)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove relationship"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface DecisionRelationshipsListProps {
  relationships: DecisionRelationship[]
  onAdd: (relationship: Omit<DecisionRelationship, 'id' | 'createdAt'>) => Promise<void>
  onRemove: (relationshipId: string) => Promise<void>
  getDecisionTitle: (decisionId: string) => string
}

export function DecisionRelationshipsList({ relationships, onAdd, onRemove, getDecisionTitle }: DecisionRelationshipsListProps) {
  // Group relationships by type
  const groupedRelationships = relationships.reduce((acc, relationship) => {
    if (!acc[relationship.type]) {
      acc[relationship.type] = [];
    }
    acc[relationship.type].push(relationship);
    return acc;
  }, {} as Record<DecisionRelationshipType, DecisionRelationship[]>);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-xl text-muted-foreground">Related Decisions</h2>
        <AddDecisionRelationshipDialog onAdd={onAdd}>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            title="Add related decision"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </AddDecisionRelationshipDialog>
      </div>
      <div className="space-y-4">
        {Object.entries(groupedRelationships).map(([type, typeRelationships]) => (
          <div key={type} className="space-y-2">
            <h3 className="text-sm font-medium text-muted-foreground capitalize">{type}</h3>
            {typeRelationships.map((relationship) => (
              <DecisionRelationshipItem
                key={relationship.id}
                relationship={relationship}
                onRemove={onRemove}
                relatedDecisionTitle={getDecisionTitle(relationship.toDecisionId)}
              />
            ))}
          </div>
        ))}
        {relationships.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            No related decisions added yet
          </p>
        )}
      </div>
    </div>
  )
} 