"use client";

import { Button } from "@decision-copilot/ui";
import { List, Network } from "lucide-react";
import { useState } from "react";
import { StakeholderListView } from "./StakeholderListView";
import { TeamHierarchyTree } from "./TeamHierarchyTree";

export interface Stakeholder {
  id: string;
  displayName: string;
  teamId: string;
  role?: string;
}

interface StakeholderSelectionViewProps {
  organisationId: string;
  onStakeholderChange: (stakeholderId: string | string[], selected: boolean) => void;
  selectedStakeholderIds: string[];
  driverStakeholderId?: string;
}

export function StakeholderSelectionView({ 
  organisationId, 
  onStakeholderChange,
  selectedStakeholderIds,
  driverStakeholderId
}: StakeholderSelectionViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('hierarchy');

  // Handle team selection - this is a no-op
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleTeamSelect = (teamId: string, checked: boolean) => {
    // Team selection is handled by the TeamHierarchyTree component
    // The actual selection of stakeholders happens in TeamHierarchyTree
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-end items-center">
        <div className="flex items-center gap-2">
          <Button 
            variant={viewMode === 'list' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4 mr-2" />
            List View
          </Button>
          <Button 
            variant={viewMode === 'hierarchy' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setViewMode('hierarchy')}
          >
            <Network className="h-4 w-4 mr-2" />
            Hierarchy View
          </Button>
        </div>
      </div>

      {viewMode === 'hierarchy' ? (
        <TeamHierarchyTree 
          organisationId={organisationId}
          onTeamSelect={handleTeamSelect}
          onStakeholderSelect={onStakeholderChange}
          selectedStakeholderIds={selectedStakeholderIds}
          driverStakeholderId={driverStakeholderId}
        />
      ) : (
        <StakeholderListView
          organisationId={organisationId}
          selectedStakeholderIds={selectedStakeholderIds}
          onStakeholderChange={(id, checked) => onStakeholderChange(id, checked)}
          driverStakeholderId={driverStakeholderId}
        />
      )}
    </div>
  );
} 