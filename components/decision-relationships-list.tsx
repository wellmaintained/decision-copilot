import { Decision, DecisionRelationshipType } from "@/lib/domain/Decision";
import { Button } from "@/components/ui/button";
import { AddDecisionRelationshipDialog } from "@/components/add-decision-relationship-dialog";
import {
  useDecisionRelationships,
  SelectedDecisionDetails,
} from "@/hooks/useDecisionRelationships";
import { Plus, X } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface DecisionRelationshipItemProps {
  targetDecision: Decision;
  type: DecisionRelationshipType;
  onRemove: (
    type: DecisionRelationshipType,
    targetDecision: Decision,
  ) => Promise<void>;
}

function DecisionRelationshipItem({
  targetDecision,
  type,
  onRemove,
}: DecisionRelationshipItemProps) {
  const isWasBlockedBy = type === "was_blocked_by";

  return (
    <div className="flex items-center justify-between p-2 bg-muted rounded-md group">
      <div>
        <Link
          href={`/organisation/${targetDecision.organisationId}/decision/${targetDecision.id}/edit`}
          className={cn(
            "font-medium hover:underline",
            isWasBlockedBy && "line-through text-muted-foreground",
          )}
        >
          {targetDecision.title}
        </Link>
      </div>
      {!isWasBlockedBy && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRemove(type, targetDecision)}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          title="Remove relationship"
        >
          <X className="h-4 w-4" />
        </Button>
      )}
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
  const { addRelationship, removeRelationship } =
    useDecisionRelationships(fromDecision);

  const getRelationshipsForType = (type: DecisionRelationshipType) => {
    let relationships = [];

    // If we're showing blocked_by relationships, also include was_blocked_by
    if (type === "blocked_by") {
      relationships = [
        ...fromDecision.getRelationshipsByType("blocked_by"),
        ...fromDecision.getRelationshipsByType("was_blocked_by"),
      ];
    } else {
      relationships = fromDecision.getRelationshipsByType(type);
    }

    return relationships.map((relationship) => ({
      targetDecision: Decision.create({
        id: relationship.targetDecision.id,
        title: relationship.targetDecisionTitle,
        description: "",
        cost: "low",
        createdAt: new Date(),
        reversibility: "hat",
        stakeholders: [],
        driverStakeholderId: "",
        organisationId: fromDecision.organisationId,
        teamIds: [],
        projectIds: [],
        supportingMaterials: [],
      }),
      type: relationship.type,
    }));
  };

  const handleAdd = async (details: SelectedDecisionDetails) => {
    await addRelationship(details, relationshipType);
  };

  const handleRemove = async (
    type: DecisionRelationshipType,
    targetDecision: Decision,
  ) => {
    await removeRelationship(type, targetDecision);
  };

  const getRelationshipDescriptionForAddDialog = (
    type: DecisionRelationshipType,
  ): string => {
    switch (type) {
      case "blocked_by":
        return "Select a decision that blocks this decision";
      case "blocks":
        return "Select a decision that this decision blocks";
      case "supersedes":
        return "Select a decision that this decision supersedes";
      case "superseded_by":
        return "Select a decision that supersedes this decision";
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
          relationshipDescription={getRelationshipDescriptionForAddDialog(
            relationshipType,
          )}
          organisationId={fromDecision.organisationId}
        >
          <Button variant="ghost" size="icon" className="h-6 w-6 ml-1 -mt-0.5">
            <Plus className="h-4 w-4" />
          </Button>
        </AddDecisionRelationshipDialog>
      </div>
      <div className="space-y-2">
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
