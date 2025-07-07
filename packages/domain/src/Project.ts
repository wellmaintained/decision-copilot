import { IsString, MinLength, validateSync } from 'class-validator'
import { DomainValidationError } from './DomainValidationError'

export interface ProjectProps {
  id: string
  name: string
  description: string
  organisationId: string
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
  readonly organisationId: string

  private constructor(props: ProjectProps) {
    this.id = props.id
    this.name = props.name
    this.description = props.description
    this.organisationId = props.organisationId
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
} 