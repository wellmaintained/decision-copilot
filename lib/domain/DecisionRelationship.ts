import { IsDate, IsEnum, IsString } from 'class-validator'
import { DecisionDependencyError } from '@/lib/domain/DecisionError'
import { Decision } from '@/lib/domain/Decision'

export type DecisionRelationshipType = "blocked_by" | "supersedes" | "blocks" | "superseded_by"

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

  @IsEnum(['blocked_by', 'supersedes', 'blocks', 'superseded_by'])
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

  static createBlockedByRelationship(
    fromDecision: Decision,
    toDecision: Decision
  ): DecisionRelationship {
    if (fromDecision.id === toDecision.id) {
      throw new DecisionDependencyError('Decision cannot block itself')
    }

    if (fromDecision.organisationId !== toDecision.organisationId) {
      throw new DecisionDependencyError('Decisions must belong to the same organisation')
    }

    return DecisionRelationship.create({
      fromDecisionId: fromDecision.id,
      fromTeamId: fromDecision.teamId,
      fromProjectId: fromDecision.projectId,
      type: 'blocked_by',
      toDecisionId: toDecision.id,
      toTeamId: toDecision.teamId,
      toProjectId: toDecision.projectId,
      createdAt: new Date(),
      organisationId: fromDecision.organisationId
    })
  }

  static createSupersedesRelationship(
    fromDecision: Decision,
    toDecision: Decision
  ): DecisionRelationship {
    if (fromDecision.id === toDecision.id) {
      throw new DecisionDependencyError('Decision cannot supersede itself')
    }

    if (fromDecision.organisationId !== toDecision.organisationId) {
      throw new DecisionDependencyError('Decisions must belong to the same organisation')
    }

    return DecisionRelationship.create({
      fromDecisionId: fromDecision.id,
      fromTeamId: fromDecision.teamId,
      fromProjectId: fromDecision.projectId,
      type: 'supersedes',
      toDecisionId: toDecision.id,
      toTeamId: toDecision.teamId,
      toProjectId: toDecision.projectId,
      createdAt: new Date(),
      organisationId: fromDecision.organisationId
    })
  }
} 