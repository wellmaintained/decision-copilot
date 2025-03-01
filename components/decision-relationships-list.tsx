import { Decision, DecisionRelationshipType } from '@/lib/domain/Decision'
import { Button } from '@/components/ui/button'
import { AddDecisionRelationshipDialog } from '@/components/add-decision-relationship-dialog'
import { useDecisionRelationships, SelectedDecisionDetails } from '@/hooks/useDecisionRelationships'
import { Plus } from 'lucide-react'

interface DecisionRelationshipItemProps {
  targetDecision: Decision;
  type: DecisionRelationshipType;
  onRemove: (type: DecisionRelationshipType, targetDecision: Decision) => Promise<void>;
}

function DecisionRelationshipItem({ targetDecision, type, onRemove }: DecisionRelationshipItemProps) {
  return (
    <div className="flex items-center justify-between p-2 border rounded-lg mb-2">
      <div>
        <p className="font-medium">{targetDecision.title}</p>
      </div>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onRemove(type, targetDecision)}
      >
        Remove
      </Button>
    </div>
  );
}

interface DecisionRelationshipsListProps {
  fromDecision: Decision;
  relationshipType: DecisionRelationshipType;
  title: string;
}

export function DecisionRelationshipsList({
  fromDecision,
  relationshipType,
  title,
}: DecisionRelationshipsListProps) {
  const { addRelationship, removeRelationship } = useDecisionRelationships(fromDecision);

  const getRelationshipsForType = (type: DecisionRelationshipType) => {
    const relationships = fromDecision.getRelationshipsByType(type);
    return relationships.map(relationship => ({
      targetDecision: Decision.create({
        id: relationship.targetDecision.id,
        title: relationship.targetDecisionTitle,
        description: '',
        cost: 'low',
        createdAt: new Date(),
        criteria: [],
        options: [],
        reversibility: 'hat',
        stakeholders: [],
        driverStakeholderId: '',
        organisationId: fromDecision.organisationId,
        teamId: fromDecision.teamId,
        projectId: fromDecision.projectId,
        supportingMaterials: []
      }),
      type: relationship.type
    }));
  };

  const handleAdd = async (details: SelectedDecisionDetails) => {
    await addRelationship(details, relationshipType);
  };

  const handleRemove = async (type: DecisionRelationshipType, targetDecision: Decision) => {
    await removeRelationship(type, targetDecision);
  };

  const getRelationshipDescriptionForAddDialog = (type: DecisionRelationshipType): string => {
    switch (type) {
      case 'blocked_by':
        return 'Select a decision that blocks this decision';
      case 'blocks':
        return 'Select a decision that this decision blocks';
      case 'supersedes':
        return 'Select a decision that this decision supersedes';
      case 'superseded_by':
        return 'Select a decision that supersedes this decision';
    }
  };

  const relationships = getRelationshipsForType(relationshipType);
  const hasRelationships = relationships.length > 0;

  return (
    <div>
      <div className="flex items-center mb-2">
        <h3 className="text-base text-muted-foreground font-normal">{title}</h3>
        <AddDecisionRelationshipDialog
          onAdd={handleAdd}
          relationshipDescription={getRelationshipDescriptionForAddDialog(relationshipType)}
        >
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 -mt-0.5">
            <Plus className="h-4 w-4" />
          </Button>
        </AddDecisionRelationshipDialog>
      </div>
      <div>
        {hasRelationships ? (
          relationships.map((relationship) => (
            <DecisionRelationshipItem
              key={relationship.targetDecision.id}
              targetDecision={relationship.targetDecision}
              type={relationship.type}
              onRemove={handleRemove}
            />
          ))
        ) : (
          <div className="text-sm text-muted-foreground italic">None</div>
        )}
      </div>
    </div>
  );
} 