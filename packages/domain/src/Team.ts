import './reflect'
import { Type } from 'class-transformer'
import { IsString, MinLength, ValidateNested, validateSync } from 'class-validator'
import { DomainValidationError } from './DomainValidationError'
import { Project } from './Project'

// Minimal interface to avoid circular dependency
interface OrganisationReference {
  id: string;
  name: string;
}

export interface TeamProps {
  id: string
  name: string
  projects: Project[]
  organisation: OrganisationReference
}

export class Team {
  @IsString()
  readonly id: string

  @IsString()
  @MinLength(3)
  readonly name: string

  @ValidateNested({ each: true })
  @Type(() => Project)
  readonly projects: Project[]

  readonly organisation: OrganisationReference

  private constructor(props: TeamProps) {
    this.id = props.id
    this.name = props.name
    this.organisation = props.organisation
    this.projects = props.projects.map(p => Project.create(p))
    this.validate()
  }

  private validate(): void {
    const errors = validateSync(this)
    if (errors.length > 0) {
      throw new DomainValidationError(errors)
    }
  }

  static create(props: TeamProps): Team {
    return new Team(props)
  }

  findProject(projectId: string): Project | undefined {
    return this.projects.find(project => project.id === projectId)
  }
} 