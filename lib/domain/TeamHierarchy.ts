export interface TeamHierarchyNode {
  id: string
  name: string
  parentId: string | null
  children: { [key: string]: TeamHierarchyNode }
}

export interface TeamHierarchyProps {
  teams: { [key: string]: TeamHierarchyNode }
}

export class TeamHierarchy {
  readonly teams: { [key: string]: TeamHierarchyNode }

  private constructor(props: TeamHierarchyProps) {
    this.teams = props.teams
  }

  static create(props: TeamHierarchyProps): TeamHierarchy {
    return new TeamHierarchy(props)
  }

  addTeam(team: TeamHierarchyNode): TeamHierarchy {
    const newTeams = { ...this.teams }
    
    // Add the new team
    newTeams[team.id] = {
      ...team,
      children: team.children || {}
    }

    // Update parent's children if it exists
    if (team.parentId && newTeams[team.parentId]) {
      newTeams[team.parentId] = {
        ...newTeams[team.parentId],
        children: {
          ...newTeams[team.parentId].children,
          [team.id]: newTeams[team.id]
        }
      }
    }

    return TeamHierarchy.create({ teams: newTeams })
  }

  updateTeam(teamId: string, updates: Partial<TeamHierarchyNode>): TeamHierarchy {
    if (!this.teams[teamId]) {
      throw new Error(`Team with id ${teamId} not found`)
    }

    const newTeams = { ...this.teams }
    newTeams[teamId] = {
      ...newTeams[teamId],
      ...updates,
      children: newTeams[teamId].children // Preserve children
    }

    return TeamHierarchy.create({ teams: newTeams })
  }

  removeTeam(teamId: string): TeamHierarchy {
    if (!this.teams[teamId]) {
      throw new Error(`Team with id ${teamId} not found`)
    }

    const newTeams = { ...this.teams }
    
    // Remove team from parent's children
    const team = newTeams[teamId]
    if (team.parentId && newTeams[team.parentId]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [teamId]: _, ...remainingChildren } = newTeams[team.parentId].children
      newTeams[team.parentId] = {
        ...newTeams[team.parentId],
        children: remainingChildren
      }
    }

    // Remove team and all its descendants
    const removeTeamAndDescendants = (id: string) => {
      const team = newTeams[id]
      if (!team) return

      // Recursively remove all children
      Object.keys(team.children || {}).forEach(childId => {
        removeTeamAndDescendants(childId)
      })

      // Remove the team itself
      delete newTeams[id]
    }

    removeTeamAndDescendants(teamId)

    return TeamHierarchy.create({ teams: newTeams })
  }

  moveTeam(teamId: string, newParentId: string | null): TeamHierarchy {
    if (!this.teams[teamId]) {
      throw new Error(`Team with id ${teamId} not found`)
    }

    if (newParentId && !this.teams[newParentId]) {
      throw new Error(`Parent team with id ${newParentId} not found`)
    }

    // Check for circular reference
    let currentId: string | null = newParentId;
    while (currentId) {
      if (currentId === teamId) {
        throw new Error('Cannot move team: would create circular reference');
      }
      currentId = this.teams[currentId].parentId;
    }

    const newTeams = { ...this.teams }
    const team = newTeams[teamId]
    const oldParentId = team.parentId

    // Remove from old parent's children
    if (oldParentId && newTeams[oldParentId]) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { [teamId]: _, ...remainingChildren } = newTeams[oldParentId].children
      newTeams[oldParentId] = {
        ...newTeams[oldParentId],
        children: remainingChildren
      }
    }

    // Update team's parent
    newTeams[teamId] = {
      ...team,
      parentId: newParentId
    }

    // Add to new parent's children
    if (newParentId) {
      newTeams[newParentId] = {
        ...newTeams[newParentId],
        children: {
          ...newTeams[newParentId].children,
          [teamId]: newTeams[teamId]
        }
      }
    }

    return TeamHierarchy.create({ teams: newTeams })
  }

  getTeam(teamId: string): TeamHierarchyNode | undefined {
    return this.teams[teamId]
  }

  getRootTeams(): TeamHierarchyNode[] {
    return Object.values(this.teams).filter(team => !team.parentId)
  }

  getChildren(teamId: string): TeamHierarchyNode[] {
    const team = this.teams[teamId]
    if (!team) return []
    return Object.values(team.children || {})
  }

  getDescendants(teamId: string): TeamHierarchyNode[] {
    const descendants: TeamHierarchyNode[] = []
    const team = this.teams[teamId]
    if (!team) return descendants

    const addDescendants = (node: TeamHierarchyNode) => {
      Object.values(node.children || {}).forEach(child => {
        descendants.push(child)
        addDescendants(child)
      })
    }

    addDescendants(team)
    return descendants
  }

  getAncestors(teamId: string): TeamHierarchyNode[] {
    const ancestors: TeamHierarchyNode[] = []
    let current = this.teams[teamId]
    
    while (current?.parentId) {
      const parent = this.teams[current.parentId]
      if (parent) {
        ancestors.push(parent)
        current = parent
      } else {
        break
      }
    }

    return ancestors
  }
} 