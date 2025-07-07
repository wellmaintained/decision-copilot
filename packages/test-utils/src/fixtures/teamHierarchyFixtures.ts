/**
 * Team hierarchy node interface for testing
 * This mirrors the TeamHierarchyNode from @decision-copilot/domain
 */
export interface TeamHierarchyNode {
  id: string
  name: string
  parentId: string | null
  children: Record<string, TeamHierarchyNode>
}

/**
 * Simple team hierarchy for testing
 */
export const simpleTeamHierarchy: Record<string, TeamHierarchyNode> = {
  'team-1': {
    id: 'team-1',
    name: 'Leadership Team',
    parentId: null,
    children: {
      'team-2': {
        id: 'team-2',
        name: 'Engineering',
        parentId: 'team-1',
        children: {}
      }
    }
  },
  'team-2': {
    id: 'team-2',
    name: 'Engineering',
    parentId: 'team-1',
    children: {}
  }
}

/**
 * Complex team hierarchy for testing
 */
export const complexTeamHierarchy: Record<string, TeamHierarchyNode> = {
  'team-1': {
    id: 'team-1',
    name: 'Executive Team',
    parentId: null,
    children: {
      'team-2': {
        id: 'team-2',
        name: 'Engineering',
        parentId: 'team-1',
        children: {
          'team-3': {
            id: 'team-3',
            name: 'Frontend',
            parentId: 'team-2',
            children: {}
          },
          'team-4': {
            id: 'team-4',
            name: 'Backend',
            parentId: 'team-2',
            children: {}
          }
        }
      },
      'team-5': {
        id: 'team-5',
        name: 'Product',
        parentId: 'team-1',
        children: {}
      }
    }
  },
  'team-2': {
    id: 'team-2',
    name: 'Engineering',
    parentId: 'team-1',
    children: {
      'team-3': {
        id: 'team-3',
        name: 'Frontend',
        parentId: 'team-2',
        children: {}
      },
      'team-4': {
        id: 'team-4',
        name: 'Backend',
        parentId: 'team-2',
        children: {}
      }
    }
  },
  'team-3': {
    id: 'team-3',
    name: 'Frontend',
    parentId: 'team-2',
    children: {}
  },
  'team-4': {
    id: 'team-4',
    name: 'Backend',
    parentId: 'team-2',
    children: {}
  },
  'team-5': {
    id: 'team-5',
    name: 'Product',
    parentId: 'team-1',
    children: {}
  }
}

/**
 * Factory function to create a team node
 */
export function createTeamNode(
  id: string,
  name: string,
  parentId: string | null = null,
  children: Record<string, TeamHierarchyNode> = {}
): TeamHierarchyNode {
  return {
    id,
    name,
    parentId,
    children
  }
}

/**
 * Factory function to create empty team hierarchy
 */
export function createEmptyTeamHierarchy(): Record<string, TeamHierarchyNode> {
  return {}
}