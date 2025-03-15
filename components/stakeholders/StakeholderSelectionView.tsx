"use client";

import { useState } from "react";
import { TeamHierarchyTree } from "./TeamHierarchyTree";
import { StakeholderListView } from "./StakeholderListView";
import { Button } from "@/components/ui/button";
import { List, Network } from "lucide-react";

export interface Stakeholder {
  id: string;
  displayName: string;
  teamId: string;
  role?: string;
}

interface StakeholderSelectionViewProps {
  organisationId: string;
  onStakeholderChange: (stakeholderId: string, selected: boolean) => void;
  selectedStakeholderIds: string[];
}

export function StakeholderSelectionView({ 
  organisationId, 
  onStakeholderChange,
  selectedStakeholderIds 
}: StakeholderSelectionViewProps) {
  const [viewMode, setViewMode] = useState<'list' | 'hierarchy'>('hierarchy');
  const [selectedTeamIds, setSelectedTeamIds] = useState<string[]>([]);

  const handleTeamSelect = async (teamId: string, checked: boolean) => {
    setSelectedTeamIds(prev => 
      checked 
        ? [...prev, teamId]
        : prev.filter(id => id !== teamId)
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Select Stakeholders</h2>
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
        />
      ) : (
        <StakeholderListView
          organisationId={organisationId}
          selectedStakeholderIds={selectedStakeholderIds}
          onStakeholderChange={onStakeholderChange}
        />
      )}

      {selectedTeamIds.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Teams</h3>
          <div className="flex flex-wrap gap-2">
            {selectedTeamIds.map(teamId => (
              <div key={teamId} className="px-3 py-1 bg-white rounded-full border text-sm">
                {teamId} {/* TODO: Replace with actual team name */}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedStakeholderIds.length > 0 && (
        <div className="mt-4 p-4 border rounded-lg bg-gray-50">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Selected Stakeholders</h3>
          <div className="flex flex-wrap gap-2">
            {/* Use Set to ensure unique stakeholder IDs */}
            {Array.from(new Set(selectedStakeholderIds)).map(id => (
              <div key={id} className="px-3 py-1 bg-white rounded-full border text-sm">
                {id} {/* TODO: Replace with actual stakeholder name */}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 