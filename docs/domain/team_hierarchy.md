# Team Hierarchy Implementation Plan

## Overview

This document outlines our approach to implementing team hierarchies in the system. The implementation follows a phased approach, starting with a simple solution for organizations with fewer teams and providing a clear path to scale as organizations grow.

## Design Goals

- **Read-optimized**: Prioritize fast reads and real-time subscriptions over write performance
- **Simple to start**: Begin with the simplest solution that meets current needs
- **Scalable path**: Provide a clear migration path as organizations grow
- **Support for visualization**: Enable intuitive UI representation of team relationships
- **Efficient stakeholder selection**: Make it easy to select entire teams as stakeholders
- **Security boundaries**: Maintain proper security isolation between different organizations

## Phased Implementation Strategy

### Phase 1: Pure Hierarchical Structure (Current Implementation)

For organizations with fewer than 100 teams, we use a single document containing the entire team hierarchy in a pure hierarchical structure.

#### Data Structure

```typescrip
// In collection: organisations/{organisationId}/teamHierarchies/hierarchy
interface TeamHierarchyDocument {
  rootTeams: Record<string, HierarchicalTeamNode>;
}

interface HierarchicalTeamNode {
  id: string;
  name: string;
  parentId: string | null;
  children: Record<string, HierarchicalTeamNode>;
  // Other team properties
}
```

#### Firestore Structure

```
organisations/
  {organisationId}/
    teamHierarchies/
      hierarchy/  // Single document containing the entire hierarchy
        rootTeams: {
          "team-1": {
            id: "team-1",
            name: "Leadership Team",
            parentId: null,
            children: {
              "team-2": {
                id: "team-2",
                name: "Engineering",
                parentId: "team-1",
                children: {
                  // Nested teams
                }
              },
              // More child teams
            }
          },
          // More root teams
        }
```

#### Domain Model Structure

In our domain model, we use a flat structure with parent-child relationships for easier manipulation:

```typescrip
interface TeamHierarchy {
  teams: Record<string, TeamHierarchyNode>;
}

interface TeamHierarchyNode {
  id: string;
  name: string;
  parentId: string | null;
  children: Record<string, TeamHierarchyNode>;
  // Other team properties
}
```

The repository layer handles the conversion between the hierarchical Firestore structure and the flat domain model structure.

#### Performance Characteristics

- **Document Size**: ~1KB per team × number of teams
- **Read Operations**: 1 read for entire hierarchy
- **Write Operations**: 1 write to update any part of hierarchy
- **Limits**: Works well for organizations with up to ~800 teams (staying under Firestore's 1MB document limit)

### Phase 2: Preparation for Scaling (When Approaching 100+ Teams)

As organizations grow, we'll enhance the data structure to prepare for future scaling.

#### Enhanced Data Structure

```typescrip
interface HierarchicalTeamNode {
  id: string;
  name: string;
  parentId: string | null;
  depth: number;      // Added: hierarchy depth (0 for root)
  path: string;       // Added: full path (e.g., "root/engineering/frontend")
  children: Record<string, HierarchicalTeamNode>;
}
```

### Phase 3: Split Hierarchies (For Organizations with 500+ Teams)

For very large organizations, we'll split the hierarchy into multiple documents.

#### Data Structure

```typescrip
// In collection: organisations/{organisationId}/teamHierarchies/roo
interface OrganisationHierarchy {
  rootTeams: {
    [teamId: string]: {
      id: string;
      name: string;
      childTeamIds: string[];  // References only
    }
  }
}

// In collection: organisations/{organisationId}/teamHierarchies/{teamId}
interface TeamHierarchyDocument {
  team: {
    id: string;
    name: string;
    parentId: string | null;
    depth: number;
    path: string;
    // Other team properties
  };
  children: {
    [childTeamId: string]: {
      id: string;
      name: string;
      childTeamIds: string[];  // References only
    }
  }
}
```

#### Firestore Structure

```
organisations/
  {organisationId}/
    teamHierarchies/
      root/       // Document containing only root teams
        rootTeams: {
          leadership: {
            id: "team-leadership",
            name: "Leadership Team",
            childTeamIds: ["team-eng", "team-product"]
          },
          // Other root teams
        }
      team-leadership/  // One document per team with its descendants
        team: {
          id: "team-leadership",
          name: "Leadership Team",
          // Other team data
        }
        children: {
          engineering: {
            id: "team-eng",
            name: "Engineering",
            childTeamIds: ["team-frontend", "team-backend"]
          }
          // Other child teams
        }
      team-eng/
        // Team hierarchy for engineering team
      // More team documents
```

## Implementation Details

### Reading and Subscribing (Phase 1)

```typescrip
// Subscribe to the team hierarchy using the hook
function TeamHierarchyView({ organisationId }) {
  const { hierarchy, loading, error } = useTeamHierarchy(organisationId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!hierarchy) return <div>No hierarchy found</div>;

  // Render the hierarchy
  return (
    <div>
      {Object.entries(hierarchy.teams)
        .filter(([_, team]) => team.parentId === null)
        .map(([teamId, team]) => (
          <TeamNode key={teamId} team={team} />
        ))}
    </div>
  );
}
```

### Updating (Phase 1)

```typescrip
// Add a new team using the hook
function AddTeamForm({ organisationId }) {
  const { addTeam } = useTeamHierarchy(organisationId);
  const [name, setName] = useState('');
  const [parentId, setParentId] = useState<string | null>(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await addTeam({
      id: `team-${Date.now()}`,
      name,
      parentId
    });
    setName('');
    setParentId(null);
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Form fields */}
    </form>
  );
}
```

### Reading and Subscribing (Phase 3)

```typescript
// Get the initial hierarchy view (root level)
async function getOrganizationRootHierarchy(orgId: string) {
  const docRef = doc(db, 'organisations', orgId, 'teamHierarchies', 'root');
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data().rootTeams || {};
  }
  return {};
}

// Get a specific team hierarchy (for expanding a branch)
async function getTeamHierarchy(orgId: string, teamId: string) {
  const docRef = doc(db, 'organisations', orgId, 'teamHierarchies', teamId);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return docSnap.data();
  }
  return null;
}

// Subscribe to hierarchy changes
function subscribeToHierarchy(orgId: string, onUpdate: (hierarchy: any) => void) {
  // Start with root subscription
  const rootUnsub = onSnapshot(
    doc(db, 'organisations', orgId, 'teamHierarchies', 'root'),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data().rootTeams || {});
      }
    }
  );

  // Return function that will be called to unsubscribe
  return () => {
    rootUnsub();
  };
}

// For expanding a specific branch
function subscribeToTeamBranch(orgId: string, teamId: string, onUpdate: (hierarchy: any) => void) {
  return onSnapshot(
    doc(db, 'organisations', orgId, 'teamHierarchies', teamId),
    (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data());
      }
    }
  );
}
```

## Migration from Phase 1 to Phase 3

When an organization grows beyond the capacity of a single document, we'll need to migrate to the split hierarchy approach.

```typescript
async function migrateToSplitHierarchy(orgId: string) {
  // 1. Fetch the current monolithic hierarchy
  const oldHierarchyDoc = await getDoc(doc(db, 'organisations', orgId, 'teamHierarchies', 'hierarchy'));
  const oldHierarchy = oldHierarchyDoc.data();
  
  // 2. Create batch for atomic updates
  const batch = writeBatch(db);
  
  // 3. Create the new root hierarchy document
  const rootTeams = {};
  Object.entries(oldHierarchy.rootTeams)
    .forEach(([id, team]) => {
      rootTeams[id] = {
        id,
        name: team.name,
        childTeamIds: Object.keys(team.children || {})
      };
    });
    
  batch.set(doc(db, 'organisations', orgId, 'teamHierarchies', 'root'), { rootTeams });
  
  // 4. Create individual team hierarchy documents for each subtree
  function processTeam(teamId, team) {
    const teamHierarchy = {
      team: {
        id: teamId,
        name: team.name,
        parentId: team.parentId,
        depth: team.depth,
        path: team.path
      },
      children: {}
    };
    
    // Add immediate children
    Object.entries(team.children || {}).forEach(([childId, childTeam]) => {
      teamHierarchy.children[childId] = {
        id: childId,
        name: childTeam.name,
        childTeamIds: Object.keys(childTeam.children || {})
      };
      
      // Process each child recursively
      processTeam(childId, childTeam);
    });
    
    // Set the team hierarchy document
    batch.set(doc(db, 'organisations', orgId, 'teamHierarchies', teamId), teamHierarchy);
  }

  // Start processing from root teams
  Object.entries(oldHierarchy.rootTeams)
    .forEach(([teamId, team]) => processTeam(teamId, team));

  // 5. Commit all the changes
  await batch.commit();
}
```

## UI Implementation

### Team Hierarchy Component

```tsx
function TeamHierarchyTree({ organisationId, onTeamSelect }) {
  const { hierarchy, loading, error } = useTeamHierarchy(organisationId);
  const [expandedTeams, setExpandedTeams] = useState<string[]>([]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!hierarchy) return <div>No hierarchy found</div>;

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

### Stakeholder Selection with Team Hierarchy

```tsx
function StakeholderSelectionView({ organisationId, selectedStakeholderIds, onStakeholderChange }) {
  const { hierarchy } = useTeamHierarchy(organisationId);
  const [stakeholdersByTeam, setStakeholdersByTeam] = useState<Record<string, Stakeholder[]>>({});

  // Fetch hierarchy and stakeholders
  useEffect(() => {
    const unsubStakeholders = subscribeToStakeholdersByTeam(organisationId, setStakeholdersByTeam);
    return () => {
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

## Security Rules

```
match /organisations/{orgId} {
  // Base organization rules

  match /teamHierarchies/{docId} {
    // Anyone in the organization can read the hierarchy
    allow read: if isOrgMember(orgId);

    // Only admins can update the hierarchy
    allow write: if isOrgAdmin(orgId);
  }
}
```

## Performance Considerations

1. **Document Size Monitoring**:
   - For Phase 1, monitor the size of the teamHierarchies documents
   - Consider migration to Phase 3 when documents approach 800KB

2. **Caching Strategy**:
   - Implement client-side caching for hierarchy data
   - Use stale-while-revalidate pattern for UI updates

3. **Batch Operations**:
   - Always use batch operations when updating multiple parts of the hierarchy

4. **Subscription Management**:
   - Carefully manage subscriptions to avoid memory leaks
   - Unsubscribe when components unmount

## Security Benefits of Subcollections

Using subcollections under the organization document provides several security benefits:

1. **Simplified Security Rules**: Security rules can be applied at the organization level and cascade to all subcollections

2. **Natural Access Control**: Access to team hierarchies is naturally tied to organization access

3. **Reduced Rule Evaluation**: Firestore evaluates fewer rules when collections are properly nested

4. **Logical Data Grouping**: All organization-related data is grouped together, making it easier to manage

## Future Enhancements

1. **Team Relationship Types**:
   - Add support for non-hierarchical team relationships (advisory, sibling)
   - Enhance UI to visualize these relationships

2. **Suggested Stakeholders**:
   - Implement algorithms to suggest stakeholders from related teams
   - Highlight leadership teams that should be considered for important decisions

3. **Access Control**:
   - Implement team-based access control for decisions
   - Allow restricting visibility of certain teams in the hierarchy

## Conclusion

This phased implementation plan allows us to start with a simple solution that meets our current needs while providing a clear path to scale as organizations grow. By using a pure hierarchical structure in Firestore, we optimize for storage efficiency while maintaining the ease of traversal in our domain model. The repository layer handles the conversion between the hierarchical storage structure and the flat domain model structure, providing a clean separation of concerns.