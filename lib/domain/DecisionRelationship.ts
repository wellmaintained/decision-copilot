import { IsDate, IsEnum, IsString } from 'class-validator'

export type DecisionRelationshipType = "blocked_by" | "supersedes"

export interface DecisionRelationshipProps {
  fromDecisionId: string
  toDecisionId: string
  type: DecisionRelationshipType
  createdAt: Date
  fromTeamId: string
  fromProjectId: string
  toTeamId: string
  toProjectId: string
  organisationId: string
}

export class DecisionRelationship {
  @IsString()
  readonly id: string

  @IsString()
  readonly fromDecisionId: string

  @IsString()
  readonly toDecisionId: string

  @IsEnum(['blocked_by', 'supersedes'])
  readonly type: DecisionRelationshipType

  @IsDate()
  readonly createdAt: Date

  @IsString()
  readonly fromTeamId: string

  @IsString()
  readonly fromProjectId: string

  @IsString()
  readonly toTeamId: string

  @IsString()
  readonly toProjectId: string

  @IsString()
  readonly organisationId: string

  private constructor(props: DecisionRelationshipProps) {
    this.id = `${props.fromDecisionId}_${props.toDecisionId}`
    this.fromDecisionId = props.fromDecisionId
    this.toDecisionId = props.toDecisionId
    this.type = props.type
    this.createdAt = props.createdAt
    this.fromTeamId = props.fromTeamId
    this.fromProjectId = props.fromProjectId
    this.toTeamId = props.toTeamId
    this.toProjectId = props.toProjectId
    this.organisationId = props.organisationId
  }

  static create(props: DecisionRelationshipProps): DecisionRelationship {
    return new DecisionRelationship(props)
  }
} 