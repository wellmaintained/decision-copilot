import { DomainValidationError } from './DomainValidationError'

export interface TeamHierarchyNode {
  id: string
  name: string
  parentId: string | null
  children: Record<string, TeamHierarchyNode>
}

export interface TeamHierarchyProps {
  teams: Record<string, TeamHierarchyNode>
}

export class TeamHierarchy {
  readonly teams: Record<string, TeamHierarchyNode>

  private constructor(props: TeamHierarchyProps) {
    this.teams = props.teams
    this.validate()
  }

  private validate(): void {
    // Validate that teams is an object
    if (!this.teams || typeof this.teams !== 'object') {
      throw new DomainValidationError([])
    }

    // Validate each team node
    Object.values(this.teams).forEach(team => {
      if (!team.id || !team.name || team.parentId === undefined || !team.children) {
        throw new Error(`Team node ${team.id} is missing required properties`)
      }
    })

    // Ensure all parent references exist
    Object.values(this.teams).forEach(team => {
      if (team.parentId && !this.teams[team.parentId]) {
        throw new Error(`Team ${team.id} references non-existent parent ${team.parentId}`)
      }
    })

    // Ensure child references match parent references
    Object.entries(this.teams).forEach(([teamId, team]) => {
      Object.keys(team.children).forEach(childId => {
        if (!this.teams[childId]) {
          throw new Error(`Team ${teamId} references non-existent child ${childId}`)
        }
        if (this.teams[childId].parentId !== teamId) {
          throw new Error(`Child team ${childId} has parentId ${this.teams[childId].parentId} but is listed as child of ${teamId}`)
        }
      })
    })
  }

  static create(props: TeamHierarchyProps): TeamHierarchy {
    // Create a deep copy of the teams to ensure immutability
    const teamsCopy: Record<string, TeamHierarchyNode> = JSON.parse(JSON.stringify(props.teams))
    
    // Ensure the children property is properly set up
    Object.entries(teamsCopy).forEach(([teamId, team]) => {
      // For each team that has a parent, make sure it's in the parent's children
      if (team.parentId) {
        const parent = teamsCopy[team.parentId]
        if (parent) {
          parent.children[teamId] = team
        }
      }
    })
    
    return new TeamHierarchy({ teams: teamsCopy })
  }

  addTeam(teamData: Omit<TeamHierarchyNode, 'children'>): TeamHierarchy {
    const { id, name, parentId } = teamData
    
    // Check if team already exists
    if (this.teams[id]) {
      throw new Error(`Team with id ${id} already exists`)
    }

    // Create new team node
    const newTeam: TeamHierarchyNode = {
      id,
      name,
      parentId,
      children: {}
    }

    // Create a copy of the current teams
    const updatedTeams = { ...this.teams }
    
    // Add the new team to the flat structure
    updatedTeams[id] = newTeam

    // If parent exists, add as child to parent
    if (parentId) {
      if (!updatedTeams[parentId]) {
        throw new Error(`Parent team ${parentId} does not exist`)
      }
      
      // Create a new parent team with the child added
      updatedTeams[parentId] = {
        ...updatedTeams[parentId],
        children: {
          ...updatedTeams[parentId].children,
          [id]: newTeam
        }
      }
    }

    return TeamHierarchy.create({ teams: updatedTeams })
  }

  updateTeam(teamData: Omit<TeamHierarchyNode, 'children'>): TeamHierarchy {
    const { id, name, parentId } = teamData
    
    // Check if team exists
    if (!this.teams[id]) {
      throw new Error(`Team with id ${id} does not exist`)
    }

    // Create a copy of the current teams
    const updatedTeams = { ...this.teams }
    
    // Update the team properties while preserving children
    updatedTeams[id] = {
      ...updatedTeams[id],
      name,
      parentId
    }

    return TeamHierarchy.create({ teams: updatedTeams })
  }

  moveTeam(teamId: string, newParentId: string | null): TeamHierarchy {
    // Check if team exists
    if (!this.teams[teamId]) {
      throw new Error(`Team with id ${teamId} does not exist`)
    }

    // Check if new parent exists (if not null)
    if (newParentId && !this.teams[newParentId]) {
      throw new Error(`New parent team ${newParentId} does not exist`)
    }

    // Get the current parent
    const currentParentId = this.teams[teamId].parentId
    
    // Create a copy of the current teams
    const updatedTeams = { ...this.teams }
    
    // Remove from current parent's children if it has a parent
    if (currentParentId) {
      const currentParentChildren = { ...updatedTeams[currentParentId].children }
      delete currentParentChildren[teamId]
      
      updatedTeams[currentParentId] = {
        ...updatedTeams[currentParentId],
        children: currentParentChildren
      }
    }
    
    // Update the team's parent reference
    updatedTeams[teamId] = {
      ...updatedTeams[teamId],
      parentId: newParentId
    }
    
    // Add to new parent's children if it has a new parent
    if (newParentId) {
      updatedTeams[newParentId] = {
        ...updatedTeams[newParentId],
        children: {
          ...updatedTeams[newParentId].children,
          [teamId]: updatedTeams[teamId]
        }
      }
    }

    return TeamHierarchy.create({ teams: updatedTeams })
  }

  removeTeam(teamId: string): TeamHierarchy {
    // Check if team exists
    if (!this.teams[teamId]) {
      throw new Error(`Team with id ${teamId} does not exist`)
    }

    // Check if team has children
    if (Object.keys(this.teams[teamId].children).length > 0) {
      throw new Error(`Cannot remove team ${teamId} because it has children`)
    }

    // Create a copy of the current teams
    const updatedTeams = { ...this.teams }
    
    // Get the parent ID
    const parentId = updatedTeams[teamId].parentId
    
    // Remove from parent's children if it has a parent
    if (parentId) {
      const parentChildren = { ...updatedTeams[parentId].children }
      delete parentChildren[teamId]
      
      updatedTeams[parentId] = {
        ...updatedTeams[parentId],
        children: parentChildren
      }
    }
    
    // Remove the team
    delete updatedTeams[teamId]

    return TeamHierarchy.create({ teams: updatedTeams })
  }
} 