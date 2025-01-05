export type DecisionStatus = 'draft' | 'published'
export type DecisionMethod = 'autocratic' | 'consent'
export type StakeholderRole = 'decider' | 'advisor' | 'observer'
export type Cost = 'low' | 'medium' | 'high'
export type Reversibility = 'hat' | 'haircut' | 'tattoo'

export interface Stakeholder {
  id: string
  name: string
  role: StakeholderRole
  avatar: string
}

export interface Criterion {
  id: string
  title: string
}

export interface Option {
  id: string
  title: string
}

export interface DecisionProps {
  id: string
  title: string
  description?: string
  context?: string
  cost: Cost
  createdAt: Date
  criteria: Criterion[]
  options: Option[]
  decision?: string
  method?: DecisionMethod
  project_id?: string
  reversibility: Reversibility
  stakeholders: Stakeholder[]
  status: DecisionStatus
  updatedAt?: Date
  user: string
}

export class Decision {
  private constructor(
    public readonly id: string,
    public title: string,
    public description: string | undefined,
    public context: string | undefined,
    public cost: Cost,
    public readonly createdAt: Date,
    public criteria: Criterion[],
    public options: Option[],
    public decision: string | undefined,
    public method: DecisionMethod | undefined,
    public project_id: string | undefined,
    public reversibility: Reversibility,
    public stakeholders: Stakeholder[],
    public status: DecisionStatus,
    public updatedAt: Date | undefined,
    public readonly user: string,
  ) {}

  static create(props: DecisionProps): Decision {
    if (!props.id) {
      throw new Error("Decision must have an ID.")
    }

    if (!props.title) {
      throw new Error("Decision must have a title.")
    }

    if (!props.cost) {
      throw new Error("Decision must have a cost.")
    }

    if (!props.reversibility) {
      throw new Error("Decision must have a reversibility.")
    }

    if (!props.user) {
      throw new Error("Decision must have a user.")
    }

    return new Decision(
      props.id,
      props.title,
      props.description,
      props.context,
      props.cost,
      props.createdAt,
      props.criteria,
      props.options,
      props.decision,
      props.method,
      props.project_id,
      props.reversibility,
      props.stakeholders,
      props.status,
      props.updatedAt,
      props.user
    )
  }

  updateTitle(newTitle: string) {
    if (!newTitle) {
      throw new Error("Title cannot be empty.")
    }
    this.title = newTitle
    this.updatedAt = new Date()
  }

  updateDescription(newDescription: string | undefined) {
    this.description = newDescription
    this.updatedAt = new Date()
  }

  updateContext(newContext: string | undefined) {
    this.context = newContext
    this.updatedAt = new Date()
  }

  updateCost(newCost: Cost) {
    this.cost = newCost
    this.updatedAt = new Date()
  }

  updateReversibility(newReversibility: Reversibility) {
    this.reversibility = newReversibility
    this.updatedAt = new Date()
  }

  updateCriteria(newCriteria: Criterion[]) {
    this.criteria = newCriteria
    this.updatedAt = new Date()
  }

  updateOptions(newOptions: Option[]) {
    this.options = newOptions
    this.updatedAt = new Date()
  }

  updateDecision(newDecision: string | undefined) {
    this.decision = newDecision
    this.updatedAt = new Date()
  }

  updateMethod(newMethod: DecisionMethod | undefined) {
    this.method = newMethod
    this.updatedAt = new Date()
  }

  updateStakeholders(newStakeholders: Stakeholder[]) {
    this.stakeholders = newStakeholders
    this.updatedAt = new Date()
  }

  publish() {
    if (!this.decision) {
      throw new Error("Cannot publish without a decision.")
    }
    if (!this.method) {
      throw new Error("Cannot publish without a decision method.")
    }
    this.status = 'published'
    this.updatedAt = new Date()
  }

  unpublish() {
    this.status = 'draft'
    this.updatedAt = new Date()
  }
}

export interface DecisionSummary {
  id: string
  title: string
  description: string
  status: DecisionStatus
  stakeholders: Stakeholder[]
  updatedAt?: Date
  createdAt: Date
  cost?: string
} 