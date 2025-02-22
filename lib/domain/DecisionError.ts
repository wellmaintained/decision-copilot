export class DecisionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionError';
  }
}

export class DecisionStateError extends DecisionError {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionStateError';
  }
}

export class StakeholderError extends DecisionError {
  constructor(message: string) {
    super(message);
    this.name = 'StakeholderError';
  }
}

export class DecisionDependencyError extends DecisionError {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionDependencyError';
  }
} 

export class DecisionRelationshipError extends DecisionError {
  constructor(message: string) {
    super(message);
    this.name = 'DecisionRelationshipError';
  }
} 