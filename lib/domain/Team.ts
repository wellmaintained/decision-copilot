import { IsString, MinLength, ValidateNested, validateSync } from 'class-validator'
import { Type } from 'class-transformer'
import { Project } from '@/lib/domain/Project'
import { DomainValidationError } from '@/lib/domain/DomainValidationError'

export interface TeamProps {
  id: string
  name: string
  organizationId: string
  projects: Project[]
}

export class Team {
  @IsString()
  readonly id: string

  @IsString()
  @MinLength(3)
  readonly name: string

  @IsString()
  readonly organizationId: string

  @ValidateNested({ each: true })
  @Type(() => Project)
  readonly projects: Project[]

  private constructor(props: TeamProps) {
    this.id = props.id
    this.name = props.name
    this.organizationId = props.organizationId
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