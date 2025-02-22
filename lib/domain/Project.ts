import { IsString, MinLength, validateSync } from 'class-validator'
import { Type } from 'class-transformer'
import { Decision } from '@/lib/domain/Decision'
import { DomainValidationError } from '@/lib/domain/DomainValidationError'

export interface ProjectProps {
  id: string
  name: string
  description: string
  teamId: string
  decisions: Decision[]
}

export class Project {
  @IsString()
  readonly id: string

  @IsString()
  @MinLength(3)
  readonly name: string

  @IsString()
  readonly description: string

  @IsString()
  readonly teamId: string

  // @ValidateNested({ each: true })
  @Type(() => Decision)
  readonly decisions: Decision[]

  private constructor(props: ProjectProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.teamId = props.teamId
    this.decisions = props.decisions.map(d => Decision.create(d))
    this.validate()
  }

  private validate(): void {
    const errors = validateSync(this)
    if (errors.length > 0) {
      throw new DomainValidationError(errors)
    }
  }

  static create(props: ProjectProps): Project {
    return new Project(props)
  }

  findDecision(decisionId: string): Decision | undefined {
    return this.decisions.find(decision => decision.id === decisionId)
  }
} 