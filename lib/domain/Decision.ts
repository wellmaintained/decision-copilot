import { Search, Settings, Lightbulb, Zap, BookOpen } from 'lucide-react'

export const DecisionWorkflowSteps = [
  { icon: Search, label: 'Identify' },
  { icon: Settings, label: 'Method' },
  { icon: Lightbulb, label: 'Options' },
  { icon: Zap, label: 'Choose' },
  { icon: BookOpen, label: 'Publish' },
] as const;

export type DecisionWorkflowStep = typeof DecisionWorkflowSteps[number];

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
  role: "decider" | "advisor" | "observer";
};

export interface SupportingMaterial {
  mimeType: string;
  title: string;
  url: string;
}

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
  supportingMaterials?: SupportingMaterial[];
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
  readonly supportingMaterials: SupportingMaterial[];

  get currentStep(): DecisionWorkflowStep {
    if (this.status === 'published') {
      return DecisionWorkflowSteps[4]; // Published step
    }
    if (this.decision) {
      return DecisionWorkflowSteps[3]; // Choose step
    }
    if (this.options.length > 0) {
      return DecisionWorkflowSteps[2]; // Options step
    }
    if (this.decisionMethod) {
      return DecisionWorkflowSteps[1]; // Method step
    }
    return DecisionWorkflowSteps[0]; // Identify step (default)
  }

  get decisionStakeholderIds(): string[] {
    return this.stakeholders.map(s => s.stakeholder_id);
  }

  addStakeholder(stakeholderId: string, role: StakeholderRole = "observer"): Decision {
    if (this.stakeholders.some(s => s.stakeholder_id === stakeholderId)) {
      return this;
    }

    return this.with({
      stakeholders: [
        ...this.stakeholders,
        {
          stakeholder_id: stakeholderId,
          role,
        },
      ],
    });
  }

  removeStakeholder(stakeholderId: string): Decision {
    // Don't allow removing the driver
    if (stakeholderId === this.driverStakeholderId) {
      return this;
    }

    return this.with({
      stakeholders: this.stakeholders.filter(s => s.stakeholder_id !== stakeholderId),
    });
  }

  setDecisionDriver(driverStakeholderId: string): Decision {
    // First ensure the driver is a stakeholder
    const withDriver = this.addStakeholder(driverStakeholderId);
    
    return withDriver.with({ 
      driverStakeholderId 
    });
  }

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
    this.supportingMaterials = props.supportingMaterials || [];
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
      supportingMaterials: [],
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
