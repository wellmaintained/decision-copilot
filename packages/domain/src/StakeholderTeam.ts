import { IsString, validateOrReject } from 'class-validator'

export interface StakeholderTeamProps {
  id: string
  stakeholderId: string
  organisationId: string
  teamId: string
}

export class StakeholderTeam {
  @IsString()
  readonly id: string

  @IsString()
  readonly stakeholderId: string

  @IsString()
  readonly organisationId: string

  @IsString()
  readonly teamId: string

  private constructor(props: StakeholderTeamProps) {
    this.id = props.id
    this.stakeholderId = props.stakeholderId
    this.organisationId = props.organisationId
    this.teamId = props.teamId
    this.validate()
  }

  static create(props: StakeholderTeamProps): StakeholderTeam {
    return new StakeholderTeam(props)
  }

  private async validate(): Promise<void> {
    await validateOrReject(this)
  }
} 