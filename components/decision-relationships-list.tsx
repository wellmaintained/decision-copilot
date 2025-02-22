import { Button } from '@/components/ui/button'
import { DecisionRelationship, DecisionRelationshipType } from '@/lib/domain/DecisionRelationship'
import { X, Plus } from 'lucide-react'
import { AddDecisionRelationshipDialog } from '@/components/add-decision-relationship-dialog'
import { useDecisionRelationships, SelectedDecisionDetails } from '@/hooks/useDecisionRelationships'
import { Decision } from '@/lib/domain/Decision'
import { useProjectDecisions } from '@/hooks/useProjectDecisions'

interface DecisionRelationshipItemProps {
  relationship: DecisionRelationship
  onRemove: (relationship: DecisionRelationship) => Promise<void>
  relatedDecisionTitle: string
}

function DecisionRelationshipItem({ relationship, onRemove, relatedDecisionTitle }: DecisionRelationshipItemProps) {
  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded-md group">
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <span className="text-sm truncate">{relatedDecisionTitle}</span>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(relationship)}
        className="opacity-0 group-hover:opacity-100 transition-opacity"
        title="Remove relationship"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  )
}

interface DecisionRelationshipsListProps {
  relationshipType: DecisionRelationshipType
  fromDecision: Decision
}

export function DecisionRelationshipsList({ 
  relationshipType, 
  fromDecision
}: DecisionRelationshipsListProps) {
  const { addRelationship, removeRelationship } = useDecisionRelationships(fromDecision);
  const { decisions } = useProjectDecisions();

  const getDecisionTitle = (decisionId: string) => {
    return decisions?.find(d => d.id === decisionId)?.title || 'Unknown Decision'
  }

  // Get relationships based on type
  const getRelationshipsForType = (type: DecisionRelationshipType): DecisionRelationship[] => {
    switch (type) {
      case 'supersedes':
        return fromDecision.supersedes;
      case 'blocked_by':
        return fromDecision.blockedBy;
      default:
        return [];
    }
  };

  // Filter relationships to only show the specified type
  const filteredRelationships = getRelationshipsForType(relationshipType);

  const handleAdd = async (selectedDecisionDetails: SelectedDecisionDetails) => {
    await addRelationship(selectedDecisionDetails, relationshipType);
  };

  const handleRemove = async (relationship: DecisionRelationship) => {
    await removeRelationship(relationship);
  };

  const getRelationshipDescription = (type: DecisionRelationshipType): string => {
    switch (type) {
      case 'supersedes':
        return 'supersedes';
      case 'blocked_by':
        return 'blocked by';
      default:
        return type;
    }
  };

  const getRelationshipDescriptionForAddDialog = (type: DecisionRelationshipType): string => {
    switch (type) {
      case 'supersedes':
        return 'superseded';
      case 'blocked_by':
        return 'blocking';
      default:
        return type;
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <h2 className="text-base text-muted-foreground"><span className="capitalize">{getRelationshipDescription(relationshipType)} decision</span>(s)</h2>
        <AddDecisionRelationshipDialog 
          onAdd={handleAdd}
          relationshipDescription={getRelationshipDescriptionForAddDialog(relationshipType)}
        >
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            title={`Add ${relationshipType} decision`}
          >
            <Plus className="h-4 w-4" />
          </Button>
        </AddDecisionRelationshipDialog>
      </div>
      <div className="space-y-2">
        {filteredRelationships.map((relationship) => (
          <DecisionRelationshipItem
            key={relationship.id}
            relationship={relationship}
            onRemove={handleRemove}
            relatedDecisionTitle={getDecisionTitle(relationship.toDecisionId)}
          />
        ))}
        {filteredRelationships.length === 0 && (
          <p className="text-sm text-muted-foreground italic">
            None
          </p>
        )}
      </div>
    </div>
  )
} 