"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { ChevronRight, Minus } from "lucide-react";
import { useTeamHierarchy } from "@/hooks/useTeamHierarchy";
import { useStakeholders } from "@/hooks/useStakeholders";
import { useStakeholderTeams } from "@/hooks/useStakeholderTeams";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { TeamHierarchyNode } from "@/lib/domain/TeamHierarchy";
import { Stakeholder } from "@/lib/domain/Stakeholder";

interface ExtendedTeamHierarchyNode extends TeamHierarchyNode {
  stakeholders: Array<Stakeholder>;
  children: Record<string, ExtendedTeamHierarchyNode>;
}

interface TeamHierarchyTreeProps {
  organisationId: string;
  onTeamSelect: (teamId: string, checked: boolean) => void;
  onStakeholderSelect?: (stakeholderId: string, checked: boolean) => void;
  selectedStakeholderIds?: string[];
}

export function TeamHierarchyTree({ 
  organisationId, 
  onTeamSelect,
  onStakeholderSelect,
  selectedStakeholderIds = []
}: TeamHierarchyTreeProps) {
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  const { hierarchy, loading: hierarchyLoading } = useTeamHierarchy(organisationId);
  const { stakeholders, loading: stakeholdersLoading } = useStakeholders();
  const { stakeholderTeams, loading: teamsLoading } = useStakeholderTeams();

  // Helper function to get stakeholders for a team
  const getTeamStakeholders = (teamId: string): Stakeholder[] => {
    const teamStakeholderIds = stakeholderTeams
      .filter(st => st.teamId === teamId)
      .map(st => st.stakeholderId);
    
    return stakeholders.filter(s => teamStakeholderIds.includes(s.id));
  };

  // Helper function to convert TeamHierarchyNode to ExtendedTeamHierarchyNode
  const extendTeamNode = (node: TeamHierarchyNode): ExtendedTeamHierarchyNode => {
    const extendedChildren: Record<string, ExtendedTeamHierarchyNode> = {};
    Object.entries(node.children).forEach(([id, child]) => {
      extendedChildren[id] = extendTeamNode(child);
    });

    return {
      ...node,
      children: extendedChildren,
      stakeholders: getTeamStakeholders(node.id)
    };
  };
  
  // Helper function to find teams containing selected stakeholders
  const findTeamsWithSelectedStakeholders = (team: ExtendedTeamHierarchyNode): string[] => {
    const teamsToExpand: string[] = [];
    
    // Check if current team has any selected stakeholders
    const hasSelectedStakeholder = team.stakeholders.some(s => 
      selectedStakeholderIds.includes(s.id)
    );
    
    if (hasSelectedStakeholder) {
      teamsToExpand.push(team.id);
    }
    
    // Recursively check child teams
    Object.values(team.children).forEach(childTeam => {
      const childTeamsToExpand = findTeamsWithSelectedStakeholders(childTeam);
      teamsToExpand.push(...childTeamsToExpand);
    });
    
    return teamsToExpand;
  };
  
  // Auto-expand teams containing selected stakeholders
  useEffect(() => {
    if (!hierarchy) return;
    
    const teamsToExpand: string[] = [];
    Object.values(hierarchy.teams).forEach(team => {
      const extendedTeam = extendTeamNode(team);
      const teamExpansions = findTeamsWithSelectedStakeholders(extendedTeam);
      teamsToExpand.push(...teamExpansions);
    });
    
    setExpandedTeams(prev => {
      const newExpanded = Array.from(teamsToExpand);
      // Keep any teams that were manually expanded
      prev.forEach(teamId => newExpanded.push(teamId));
      return Array.from(new Set(newExpanded));
    });
  }, [hierarchy, selectedStakeholderIds, stakeholders, stakeholderTeams]);

  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };

  const getAllStakeholderIds = (team: ExtendedTeamHierarchyNode): string[] => {
    const stakeholderIds = team.stakeholders.map(s => s.id);
    Object.values(team.children).forEach(childTeam => {
      stakeholderIds.push(...getAllStakeholderIds(childTeam));
    });
    return stakeholderIds;
  };

  const areAllStakeholdersSelected = (team: ExtendedTeamHierarchyNode): boolean => {
    const allStakeholderIds = getAllStakeholderIds(team);
    return allStakeholderIds.length > 0 && 
      allStakeholderIds.every(id => selectedStakeholderIds.includes(id));
  };

  const areSomeStakeholdersSelected = (team: ExtendedTeamHierarchyNode): boolean => {
    const allStakeholderIds = getAllStakeholderIds(team);
    return allStakeholderIds.some(id => selectedStakeholderIds.includes(id));
  };

  const handleTeamSelect = (teamId: string, team: ExtendedTeamHierarchyNode, checked: boolean) => {
    onTeamSelect(teamId, checked);
    if (onStakeholderSelect) {
      const stakeholderIds = getAllStakeholderIds(team);
      stakeholderIds.forEach(id => {
        onStakeholderSelect(id, checked);
      });
    }
  };

  const renderTeamNode = (teamId: string, team: TeamHierarchyNode, level: number) => {
    const extendedTeam = extendTeamNode(team);
    const isExpanded = expandedTeams.includes(teamId);
    const hasChildren = Object.keys(team.children).length > 0 || extendedTeam.stakeholders.length > 0;
    const allSelected = areAllStakeholdersSelected(extendedTeam);
    const someSelected = areSomeStakeholdersSelected(extendedTeam);
    const indentStyle = { paddingLeft: `${level * 24}px` };

    return (
      <div key={teamId}>
        <div
          className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded-md cursor-pointer group"
          style={indentStyle}
          onClick={() => hasChildren && toggleTeam(teamId)}
        >
          <div className="w-4 flex items-center justify-center">
            {hasChildren && (
              <ChevronRight
                className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`}
              />
            )}
          </div>
          <div className="relative">
            <Checkbox
              id={`team-${teamId}`}
              checked={allSelected}
              data-state={someSelected && !allSelected ? "indeterminate" : undefined}
              onCheckedChange={(checked) => {
                handleTeamSelect(teamId, extendedTeam, checked as boolean);
              }}
              onClick={(e) => e.stopPropagation()}
              className="data-[state=indeterminate]:bg-primary/20 data-[state=indeterminate]:border-primary"
            />
            {someSelected && !allSelected && (
              <Minus className="h-3 w-3 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-primary pointer-events-none" />
            )}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <span className="font-medium">{team.name}</span>
            {(extendedTeam.stakeholders.length > 0 || Object.keys(team.children).length > 0) && (
              <span className="text-xs text-gray-500">
                ({getAllStakeholderIds(extendedTeam).length})
              </span>
            )}
          </div>
        </div>

        {isExpanded && (
          <div>
            {extendedTeam.stakeholders.map((stakeholder) => (
              <div
                key={`stakeholder-${stakeholder.id}-in-team-${teamId}`}
                className="flex items-center gap-2 py-1.5 hover:bg-gray-50 rounded-md"
                style={{ paddingLeft: `${(level + 1) * 24}px` }}
              >
                <div className="w-4" />
                <Checkbox
                  id={`stakeholder-${stakeholder.id}-in-team-${teamId}`}
                  checked={selectedStakeholderIds.includes(stakeholder.id)}
                  onCheckedChange={(checked) =>
                    onStakeholderSelect?.(stakeholder.id, checked as boolean)
                  }
                />
                <Avatar className="h-6 w-6">
                  <AvatarImage src={stakeholder.photoURL} alt={stakeholder.displayName} />
                  <AvatarFallback>
                    {stakeholder.displayName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col flex-1">
                  <span className="font-medium">{stakeholder.displayName}</span>
                </div>
              </div>
            ))}

            {Object.entries(team.children).map(([childId, childTeam]) =>
              renderTeamNode(childId, childTeam, level + 1)
            )}
          </div>
        )}
      </div>
    );
  };

  if (hierarchyLoading || stakeholdersLoading || teamsLoading) {
    return <div className="flex items-center justify-center p-4">Loading...</div>;
  }

  if (!hierarchy) {
    return <div className="p-4 text-gray-500">No team hierarchy found</div>;
  }

  return (
    <div className="border rounded-lg p-4 space-y-0.5">
      {Object.entries(hierarchy.teams)
        .filter(([, team]) => team.parentId === null)
        .map(([teamId, team]) => renderTeamNode(teamId, team, 0))}
    </div>
  );
} 