import { IsDate, IsEnum, IsString } from 'class-validator'
import { DecisionDependencyError } from '@/lib/domain/DecisionError'
import { Decision } from '@/lib/domain/Decision'

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

  static createBlockingRelationship(
    blockingDecision: Decision,
    blockedDecision: Decision
  ): DecisionRelationship {
    if (blockingDecision.id === blockedDecision.id) {
      throw new DecisionDependencyError('Decision cannot block itself')
    }

    if (blockingDecision.organisationId !== blockedDecision.organisationId) {
      throw new DecisionDependencyError('Decisions must belong to the same organisation')
    }

    return DecisionRelationship.create({
      type: 'blocked_by',
      fromDecisionId: blockingDecision.id,
      toDecisionId: blockedDecision.id,
      createdAt: new Date(),
      fromTeamId: blockingDecision.teamId,
      fromProjectId: blockingDecision.projectId,
      toTeamId: blockedDecision.teamId,
      toProjectId: blockedDecision.projectId,
      organisationId: blockingDecision.organisationId
    })
  }

  static createSupersedingRelationship(
    supersedingDecision: Decision,
    supersededDecision: Decision
  ): DecisionRelationship {
    if (supersedingDecision.id === supersededDecision.id) {
      throw new DecisionDependencyError('Decision cannot supersede itself')
    }

    if (supersedingDecision.organisationId !== supersededDecision.organisationId) {
      throw new DecisionDependencyError('Decisions must belong to the same organisation')
    }

    return DecisionRelationship.create({
      type: 'supersedes',
      fromDecisionId: supersedingDecision.id,
      toDecisionId: supersededDecision.id,
      createdAt: new Date(),
      fromTeamId: supersedingDecision.teamId,
      fromProjectId: supersedingDecision.projectId,
      toTeamId: supersededDecision.teamId,
      toProjectId: supersededDecision.projectId,
      organisationId: supersedingDecision.organisationId
    })
  }
} 