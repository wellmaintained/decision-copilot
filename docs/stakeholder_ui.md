# Stakeholder Selection UI Design

## Overview

This document outlines the design for the stakeholder selection interface, focusing on making it easy for users to select stakeholders for decisions based on team hierarchies. The UI aims to provide an intuitive way to select both individual stakeholders and entire teams, while also prompting users to consider stakeholders from related teams according to organizational structure.

## Objectives

1. **Team-level Selection**: Make it easy to select an entire team of stakeholders for a decision
2. **Hierarchical Visualization**: Visually represent team relationships to help users understand the organizational structure
3. **Suggested Stakeholders**: Prompt users to consider stakeholders from leadership teams or related teams
4. **Intuitive Navigation**: Allow users to easily explore the team hierarchy and find relevant stakeholders
5. **Visual Feedback**: Provide clear visual cues about selection state and team relationships

## UI Components

### 1. Team Hierarchy Tree

The primary component for visualizing and navigating the team structure:

```tsx
function TeamHierarchyTree({ organisationId, onTeamSelect }) {
  const [hierarchy, setHierarchy] = useState<TeamHierarchy | null>(null);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);
  
  useEffect(() => {
    // Subscribe to hierarchy updates
    const unsubscribe = subscribeToTeamHierarchy(organisationId, setHierarchy);
    return unsubscribe;
  }, [organisationId]);
  
  if (!hierarchy) return <div>Loading...</div>;
  
  const toggleTeam = (teamId: string) => {
    setExpandedTeams(prev => 
      prev.includes(teamId) 
        ? prev.filter(id => id !== teamId)
        : [...prev, teamId]
    );
  };
  
  // Render the hierarchy as a tree
  const renderTeamNode = (teamId: string, team: TeamHierarchyNode, level: number) => {
    const isExpanded = expandedTeams.includes(teamId);
    
    return (
      <div key={teamId} style={{ marginLeft: level * 20 }}>
        <div className="flex items-center">
          <Checkbox 
            id={`team-${teamId}`}
            onCheckedChange={(checked) => onTeamSelect(teamId, checked as boolean)}
          />
          <div 
            className="flex items-center cursor-pointer"
            onClick={() => toggleTeam(teamId)}
          >
            {Object.keys(team.children).length > 0 && (
              isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />
            )}
            <span className="ml-2">{team.name}</span>
          </div>
        </div>
        
        {isExpanded && Object.entries(team.children).map(([childId, childTeam]) => 
          renderTeamNode(childId, childTeam, level + 1)
        )}
      </div>
    );
  };
  
  // Render the root teams
  return (
    <div className="space-y-4">
      {Object.entries(hierarchy.teams)
        .filter(([_, team]) => team.parentId === null)
        .map(([teamId, team]) => renderTeamNode(teamId, team, 0))}
    </div>
  );
}
```

### 2. Stakeholder Selection View

A more comprehensive component that combines team hierarchy with stakeholder selection:

```tsx
function StakeholderSelectionView({ organisationId, selectedStakeholderIds, onStakeholderChange }) {
  const [hierarchy, setHierarchy] = useState<TeamHierarchy | null>(null);
  const [stakeholdersByTeam, setStakeholdersByTeam] = useState<Record<string, Stakeholder[]>>({});
  
  // Fetch hierarchy and stakeholders
  useEffect(() => {
    const unsubHierarchy = subscribeToTeamHierarchy(organisationId, setHierarchy);
    const unsubStakeholders = subscribeToStakeholdersByTeam(organisationId, setStakeholdersByTeam);
    
    return () => {
      unsubHierarchy();
      unsubStakeholders();
    };
  }, [organisationId]);
  
  // Handle selecting an entire team
  const handleTeamSelection = (teamId: string, checked: boolean) => {
    const teamStakeholders = stakeholdersByTeam[teamId] || [];
    
    teamStakeholders.forEach(stakeholder => {
      onStakeholderChange(stakeholder.id, checked);
    });
  };
  
  // Render team with its stakeholders
  const renderTeamWithStakeholders = (teamId: string, team: TeamHierarchyNode, level: number) => {
    const teamStakeholders = stakeholdersByTeam[teamId] || [];
    const allTeamStakeholdersSelected = teamStakeholders.length > 0 && 
      teamStakeholders.every(s => selectedStakeholderIds.includes(s.id));
    
    return (
      <div key={teamId} className="mb-4">
        <div className="flex items-center p-2 bg-gray-50 rounded">
          <Checkbox 
            id={`team-${teamId}`}
            checked={allTeamStakeholdersSelected}
            onCheckedChange={(checked) => handleTeamSelection(teamId, checked as boolean)}
          />
          <span className="ml-2 font-medium">{team.name}</span>
          <span className="ml-2 text-sm text-gray-500">
            ({teamStakeholders.length} stakeholders)
          </span>
        </div>
        
        <div className="ml-8 mt-2">
          {teamStakeholders.map(stakeholder => (
            <div key={stakeholder.id} className="flex items-center py-1">
              <Checkbox 
                id={`stakeholder-${stakeholder.id}`}
                checked={selectedStakeholderIds.includes(stakeholder.id)}
                onCheckedChange={(checked) => onStakeholderChange(stakeholder.id, checked as boolean)}
              />
              <span className="ml-2">{stakeholder.displayName}</span>
            </div>
          ))}
        </div>
        
        {/* Render child teams */}
        <div className="ml-6 mt-2">
          {Object.entries(team.children).map(([childId, childTeam]) => 
            renderTeamWithStakeholders(childId, childTeam, level + 1)
          )}
        </div>
      </div>
    );
  };
  
  if (!hierarchy) return <div>Loading...</div>;
  
  return (
    <div className="space-y-4">
      {Object.entries(hierarchy.teams)
        .filter(([_, team]) => team.parentId === null)
        .map(([teamId, team]) => renderTeamWithStakeholders(teamId, team, 0))}
    </div>
  );
}
```

### 3. View Toggle Component

Allow users to switch between different views of the stakeholder selection interface:

```tsx
function StakeholderViewToggle({ viewMode, setViewMode }) {
  return (
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
  );
}
```

### 4. Stakeholder Suggestions Component

Proactively suggest stakeholders from leadership or related teams:

```tsx
function StakeholderSuggestions({ 
  organisationId, 
  selectedTeamIds, 
  selectedStakeholderIds, 
  onStakeholderChange 
}) {
  const [suggestions, setSuggestions] = useState<{
    leadership: Stakeholder[];
    related: Stakeholder[];
  }>({ leadership: [], related: [] });
  
  // Generate suggestions based on current selections
  useEffect(() => {
    if (selectedTeamIds.length === 0) return;
    
    // Fetch suggestions based on selected teams
    const fetchSuggestions = async () => {
      // Get leadership stakeholders
      const leadershipStakeholders = await getLeadershipStakeholders(organisationId, selectedTeamIds);
      
      // Get related team stakeholders
      const relatedStakeholders = await getRelatedTeamStakeholders(organisationId, selectedTeamIds);
      
      // Filter out already selected stakeholders
      const filteredLeadership = leadershipStakeholders.filter(
        s => !selectedStakeholderIds.includes(s.id)
      );
      
      const filteredRelated = relatedStakeholders.filter(
        s => !selectedStakeholderIds.includes(s.id)
      );
      
      setSuggestions({
        leadership: filteredLeadership,
        related: filteredRelated
      });
    };
    
    fetchSuggestions();
  }, [organisationId, selectedTeamIds, selectedStakeholderIds]);
  
  if (suggestions.leadership.length === 0 && suggestions.related.length === 0) {
    return null;
  }
  
  return (
    <div className="mt-6 border rounded-lg p-4">
      <h3 className="text-lg font-medium mb-3">Suggested Stakeholders</h3>
      
      {suggestions.leadership.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-amber-700 mb-2">
            Leadership Stakeholders
          </h4>
          <div className="space-y-2">
            {suggestions.leadership.map(stakeholder => (
              <div key={stakeholder.id} className="flex items-center">
                <Checkbox 
                  id={`suggestion-${stakeholder.id}`}
                  onCheckedChange={(checked) => onStakeholderChange(stakeholder.id, checked as boolean)}
                />
                <span className="ml-2">{stakeholder.displayName}</span>
                <Badge className="ml-2" variant="outline">Leadership</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {suggestions.related.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-blue-700 mb-2">
            Related Team Stakeholders
          </h4>
          <div className="space-y-2">
            {suggestions.related.map(stakeholder => (
              <div key={stakeholder.id} className="flex items-center">
                <Checkbox 
                  id={`suggestion-${stakeholder.id}`}
                  onCheckedChange={(checked) => onStakeholderChange(stakeholder.id, checked as boolean)}
                />
                <span className="ml-2">{stakeholder.displayName}</span>
                <Badge className="ml-2" variant="outline">Related</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

## Visual Design

### Team Hierarchy Visualization

The team hierarchy will be visualized as an expandable tree structure:

1. **Root Teams**: Top-level teams displayed at the left margin
2. **Child Teams**: Indented under their parent teams
3. **Expansion Controls**: Chevron icons to expand/collapse team hierarchies
4. **Selection Controls**: Checkboxes for selecting teams and individual stakeholders
5. **Visual Indicators**: 
   - Team badges to indicate team type (Leadership, Engineering, etc.)
   - Count of stakeholders per team
   - Indentation to show hierarchy depth

### Team Relationship Visualization

For organizations with defined team relationships:

1. **Parent-Child**: Represented through indentation and tree structure
2. **Leadership Teams**: Highlighted with special styling or badges
3. **Related Teams**: Connected with dotted lines or highlighted when a related team is selected
4. **Advisory Relationships**: Indicated with special badges or icons

### Selection States

Clear visual feedback for selection states:

1. **Fully Selected Team**: Checkbox checked when all team members are selected
2. **Partially Selected Team**: Indeterminate checkbox state when some team members are selected
3. **Selected Stakeholder**: Checked checkbox for individual stakeholders
4. **Suggested Stakeholders**: Highlighted with a different background color or badge

## Interaction Patterns

### Team Selection

1. **Select All**: Clicking a team's checkbox selects all stakeholders in that team
2. **Partial Selection**: Selecting individual stakeholders updates the team's checkbox state
3. **Hierarchical Selection**: Option to select a team and all its sub-teams

### Navigation

1. **Expand/Collapse**: Click on chevron icons to expand or collapse team hierarchies
2. **Search**: Filter stakeholders and teams by name or role
3. **View Modes**: Toggle between different views (list, hierarchy, etc.)

### Suggestions

1. **Automatic Suggestions**: Based on selected teams, suggest stakeholders from:
   - Leadership teams
   - Related teams
   - Teams that frequently collaborate
2. **Contextual Prompts**: Display messages encouraging consideration of key stakeholders

## Implementation Considerations

### Performance

1. **Lazy Loading**: For large organizations, load team details on demand
2. **Virtualized Lists**: Use virtualization for long lists of stakeholders
3. **Efficient Rendering**: Minimize re-renders when selection state changes

### Accessibility

1. **Keyboard Navigation**: Full keyboard support for navigating the hierarchy
2. **Screen Reader Support**: Proper ARIA attributes for tree structure
3. **Focus Management**: Clear focus indicators and logical tab order

### Responsive Design

1. **Mobile View**: Simplified view for small screens
2. **Touch Targets**: Larger touch targets for mobile users
3. **Progressive Disclosure**: Show less information initially on small screens

## Future Enhancements

1. **Stakeholder Avatars**: Display profile pictures for stakeholders
2. **Team Analytics**: Show statistics about team involvement in decisions
3. **Stakeholder Roles**: Indicate stakeholder roles within teams
4. **Custom Views**: Allow users to save custom views of the hierarchy
5. **Drag and Drop**: Allow reorganizing teams via drag and drop
6. **Relationship Visualization**: More sophisticated visualization of team relationships

## Conclusion

This stakeholder selection UI design provides an intuitive way for users to select stakeholders based on team hierarchies. By visualizing the organizational structure and providing team-level selection capabilities, we make it easier for users to include all relevant stakeholders in their decisions. The suggestion mechanism helps ensure that important stakeholders from leadership or related teams are not overlooked. 