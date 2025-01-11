import { IsString, MinLength, ValidateNested, validateSync } from 'class-validator'
import { Type } from 'class-transformer'
import { Team } from '@/lib/domain/Team'
import { DomainValidationError } from '@/lib/domain/DomainValidationError'

export interface OrganizationProps {
  id: string
  name: string
  teams: Team[]
}

export class Organization {
  @IsString()
  readonly id: string

  @IsString()
  @MinLength(3)
  readonly name: string

  @ValidateNested({ each: true })
  @Type(() => Team)
  readonly teams: Team[]

  private constructor(props: OrganizationProps) {
    this.id = props.id
    this.name = props.name
    this.teams = props.teams.map(t => Team.create(t))
    this.validate()
  }

  private validate(): void {
    const errors = validateSync(this)
    if (errors.length > 0) {
      throw new DomainValidationError(errors)
    }
  }

  static create(props: OrganizationProps): Organization {
    return new Organization(props)
  }

  findTeam(teamId: string): Team | undefined {
    return this.teams.find(team => team.id === teamId)
  }
} 