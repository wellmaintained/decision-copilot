export type DecisionStatus = "draft" | "published";
export type DecisionMethod = "autocratic" | "consent";
export type StakeholderRole = "decider" | "advisor" | "observer";
export type Cost = "low" | "medium" | "high";
export type Reversibility = "hat" | "haircut" | "tattoo";

export interface Criterion {
  id: string;
  title: string;
}

export interface Option {
  id: string;
  title: string;
}

export type DecisionStakeholderRole = {
  stakeholder_id: string;
  role: "decider" | "observer";
};

export type DecisionProps = {
  id: string;
  title: string;
  description: string;
  cost: Cost;
  createdAt: Date;
  criteria: string[];
  options: string[];
  decision?: string;
  decisionMethod?: string;
  reversibility: Reversibility;
  stakeholders: DecisionStakeholderRole[];
  status: string;
  updatedAt?: Date;
  driverStakeholderId: string;
};

export class Decision {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly cost: Cost;
  readonly createdAt: Date;
  readonly criteria: string[];
  readonly options: string[];
  readonly decision?: string;
  readonly decisionMethod?: string;
  readonly reversibility: Reversibility;
  readonly stakeholders: DecisionStakeholderRole[];
  readonly status: string;
  readonly updatedAt?: Date;
  readonly driverStakeholderId: string;

  private constructor(props: DecisionProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.cost = props.cost;
    this.createdAt = props.createdAt;
    this.criteria = props.criteria;
    this.options = props.options;
    this.decision = props.decision;
    this.decisionMethod = props.decisionMethod;
    this.reversibility = props.reversibility;
    this.stakeholders = props.stakeholders;
    this.status = props.status;
    this.updatedAt = props.updatedAt;
    this.driverStakeholderId = props.driverStakeholderId;
  }

  static create(props: DecisionProps): Decision {
    return new Decision(props);
  }

  static createEmptyDecision(defaultOverrides: Partial<DecisionProps> = {}): Decision {
    const now = new Date();
    const defaults: DecisionProps = {
      id: 'unsaved',
      title: '',
      description: '',
      cost: 'low' as Cost,
      createdAt: now,
      criteria: [],
      options: [],
      reversibility: 'hat' as Reversibility,
      stakeholders: [],
      status: 'draft',
      updatedAt: now,
      driverStakeholderId: '',
      decision: '',
      decisionMethod: '',
    };

    return new Decision({
      ...defaults,
      ...defaultOverrides,
    });
  }

  with(props: Partial<DecisionProps>): Decision {
    return Decision.create({
      ...this,
      ...props,
    });
  }
}
