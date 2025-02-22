import { Search, Settings, Lightbulb, Zap, BookOpen } from 'lucide-react'
import { SupportingMaterial } from '@/lib/domain/SupportingMaterial'
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator'
import { DecisionStateError, StakeholderError } from '@/lib/domain/DecisionError'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'

export const DecisionWorkflowSteps = [
  { icon: Search, label: 'Identify' },
  { icon: Settings, label: 'Method' },
  { icon: Lightbulb, label: 'Options' },
  { icon: Zap, label: 'Choose' },
  { icon: BookOpen, label: 'Publish' },
] as const;

export type DecisionWorkflowStep = typeof DecisionWorkflowSteps[number];

export type DecisionStatus = "in_progress" | "blocked" | "published" | "superseded";
export type DecisionMethod = "accountable_individual" | "consent";
export type StakeholderRole = "decider" | "consulted" | "informed";
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
  role: StakeholderRole;
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
  publishDate?: Date;
  updatedAt?: Date;
  driverStakeholderId: string;
  supportingMaterials?: SupportingMaterial[];
  organisationId: string;
  teamId: string;
  projectId: string;
  relationships?: DecisionRelationship[];
};

export class Decision {
  @IsString()
  readonly id: string;

  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsEnum(['low', 'medium', 'high'])
  readonly cost: Cost;

  @IsDate()
  readonly createdAt: Date;

  @IsArray()
  @IsString({ each: true })
  readonly criteria: string[];

  @IsArray()
  @IsString({ each: true })
  readonly options: string[];

  @IsOptional()
  @IsString()
  readonly decision?: string;

  @IsOptional()
  @IsString()
  readonly decisionMethod?: string;

  @IsEnum(['hat', 'haircut', 'tattoo'])
  readonly reversibility: Reversibility;

  @IsArray()
  readonly stakeholders: DecisionStakeholderRole[];

  @IsOptional()
  @IsDate()
  readonly publishDate?: Date;

  @IsOptional()
  @IsDate()
  readonly updatedAt?: Date;

  @IsString()
  readonly driverStakeholderId: string;

  @IsArray()
  readonly supportingMaterials: SupportingMaterial[];

  @IsString()
  readonly organisationId: string;

  @IsString()
  readonly teamId: string;

  @IsString()
  readonly projectId: string;

  @IsOptional()
  @IsArray()
  readonly relationships?: DecisionRelationship[];

  get supersededBy(): DecisionRelationship[] {
    return this.relationships?.filter(r => 
      r.type === 'supersedes' && 
      r.toDecisionId === this.id
    ) ?? [];
  }

  get supersedes(): DecisionRelationship[] {
    return this.relationships?.filter(r => 
      r.type === 'supersedes' && 
      r.fromDecisionId === this.id
    ) ?? [];
  }

  get blockedBy(): DecisionRelationship[] {
    return this.relationships?.filter(r => 
      r.type === 'blocked_by' && 
      r.toDecisionId === this.id
    ) ?? [];
  }

  get blocks(): DecisionRelationship[] {
    return this.relationships?.filter(r => 
      r.type === 'blocked_by' && 
      r.fromDecisionId === this.id
    ) ?? [];
  }

  get status(): DecisionStatus {
    // Check if superseded
    if (this.supersededBy.length > 0) {
      return 'superseded';
    }

    // Check if blocked
    if (this.blockedBy.length > 0) {
      return 'blocked';
    }

    // Check if published
    if (this.publishDate) {
      return 'published';
    }

    // Default state
    return 'in_progress';
  }

  get currentStep(): DecisionWorkflowStep {
    if (this.status === 'published' || this.status === 'superseded') {
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

  isBlockedBy(decisionId: string): boolean {
    return this.blocks.some(r => r.toDecisionId === decisionId);
  }

  canProceed(completedDecisionIds: string[]): boolean {
    return this.blocks.every(r => completedDecisionIds.includes(r.toDecisionId));
  }

  isSuperseded(): boolean {
    return this.status === 'superseded' && this.supersededBy.length > 0;
  }

  addStakeholder(stakeholderId: string, role: StakeholderRole = "informed"): Decision {
    if (this.stakeholders.some(s => s.stakeholder_id === stakeholderId)) {
      throw new StakeholderError(`Stakeholder ${stakeholderId} is already part of this decision`);
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
    if (stakeholderId === this.driverStakeholderId) {
      throw new StakeholderError('Cannot remove the driver stakeholder');
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
    this.publishDate = props.publishDate;
    this.updatedAt = props.updatedAt;
    this.driverStakeholderId = props.driverStakeholderId;
    this.supportingMaterials = props.supportingMaterials || [];
    this.organisationId = props.organisationId;
    this.teamId = props.teamId;
    this.projectId = props.projectId;
    this.relationships = props.relationships || [];
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
      cost: 'medium' as Cost,
      createdAt: now,
      criteria: [],
      options: [],
      reversibility: 'hat' as Reversibility,
      stakeholders: [],
      updatedAt: now,
      driverStakeholderId: '',
      decision: '',
      decisionMethod: '',
      supportingMaterials: [],
      organisationId: '',
      teamId: '',
      projectId: '',
      relationships: [],
    };

    return new Decision({
      ...defaults,
      ...defaultOverrides,
    });
  }

  with(props: Partial<DecisionProps>): Decision {
    if (this.status === 'published' || this.status === 'superseded') {
      throw new DecisionStateError(`Cannot modify ${this.status} decisions`);
    }

    return Decision.create({
      ...this,
      ...props,
      updatedAt: new Date()
    });
  }

  withoutId(): Omit<DecisionProps, "id"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...propsWithoutId } = this;
    return propsWithoutId;
  }
}
