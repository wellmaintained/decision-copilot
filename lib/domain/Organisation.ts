import '@/lib/domain/reflect'
import { IsString, MinLength, ValidateNested, validateSync } from 'class-validator'
import { Type } from 'class-transformer'
import { Team } from '@/lib/domain/Team'
import { DomainValidationError } from '@/lib/domain/DomainValidationError'

export interface OrganisationProps {
  id: string
  name: string
  teams: Team[]
}

export class Organisation {
  @IsString()
  readonly id: string

  @IsString()
  @MinLength(3)
  readonly name: string

  @ValidateNested({ each: true })
  @Type(() => Team)
  readonly teams: Team[]

  private constructor(props: OrganisationProps) {
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

  static create(props: OrganisationProps): Organisation {
    return new Organisation(props)
  }

  findTeam(teamId: string): Team | undefined {
    return this.teams.find(team => team.id === teamId)
  }
} 