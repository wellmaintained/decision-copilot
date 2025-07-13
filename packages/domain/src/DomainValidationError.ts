import { ValidationError } from 'class-validator'

export class DomainValidationError extends Error {
  constructor(validationErrors: ValidationError[]) {
    const message = DomainValidationError.formatValidationErrors(validationErrors)
    super(message)
    this.name = 'DomainValidationError'
  }

  private static formatValidationErrors(errors: ValidationError[]): string {
    return errors
      .map(error => {
        const constraints = error.constraints ? Object.values(error.constraints) : []
        return `${error.property}: ${constraints.join(', ')}`
      })
      .join('\n')
  }
} 