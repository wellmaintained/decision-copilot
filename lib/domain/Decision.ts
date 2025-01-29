import { Search, Settings, Lightbulb, Zap, BookOpen } from 'lucide-react'
import { SupportingMaterial } from '@/lib/domain/SupportingMaterial'
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from 'class-validator'
import { DecisionStateError, StakeholderError, DecisionDependencyError } from '@/lib/domain/DecisionError'

export const DecisionWorkflowSteps = [
  { icon: Search, label: 'Identify' },
  { icon: Settings, label: 'Method' },
  { icon: Lightbulb, label: 'Options' },
  { icon: Zap, label: 'Choose' },
  { icon: BookOpen, label: 'Publish' },
] as const;

export type DecisionWorkflowStep = typeof DecisionWorkflowSteps[number];

export type DecisionStatus = "draft" | "published" | "superseded";
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
  status: DecisionStatus;
  updatedAt?: Date;
  driverStakeholderId: string;
  supportingMaterials?: SupportingMaterial[];
  organisationId: string;
  teamId: string;
  projectId: string;
  blockedByDecisionIds: string[];
  supersededByDecisionId?: string;
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

  @IsEnum(['draft', 'published', 'superseded'])
  readonly status: DecisionStatus;

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

  @IsArray()
  @IsString({ each: true })
  readonly blockedByDecisionIds: string[];

  @IsOptional()
  @IsString()
  readonly supersededByDecisionId?: string;

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
    return this.blockedByDecisionIds.includes(decisionId);
  }

  canProceed(completedDecisionIds: string[]): boolean {
    return this.blockedByDecisionIds.every(id => completedDecisionIds.includes(id));
  }

  isSuperseded(): boolean {
    return this.status === 'superseded' && !!this.supersededByDecisionId;
  }

  addStakeholder(stakeholderId: string, role: StakeholderRole = "observer"): Decision {
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

  addBlockingDecision(blockingDecisionId: string): Decision {
    if (blockingDecisionId === this.id) {
      throw new DecisionDependencyError('A decision cannot block itself');
    }

    if (this.blockedByDecisionIds.includes(blockingDecisionId)) {
      throw new DecisionDependencyError(`Decision ${blockingDecisionId} is already blocking this decision`);
    }

    return this.with({
      blockedByDecisionIds: [...this.blockedByDecisionIds, blockingDecisionId]
    });
  }

  removeBlockingDecision(blockingDecisionId: string): Decision {
    return this.with({
      blockedByDecisionIds: this.blockedByDecisionIds.filter(id => id !== blockingDecisionId)
    });
  }

  markAsSupersededBy(newDecisionId: string): Decision {
    if (this.status === 'superseded') {
      throw new DecisionStateError(`Decision is already superseded by ${this.supersededByDecisionId}`);
    }

    return this.with({
      supersededByDecisionId: newDecisionId,
      status: 'superseded'
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
    this.organisationId = props.organisationId;
    this.teamId = props.teamId;
    this.projectId = props.projectId;
    this.blockedByDecisionIds = props.blockedByDecisionIds || [];
    this.supersededByDecisionId = props.supersededByDecisionId;
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
      organisationId: '',
      teamId: '',
      projectId: '',
      blockedByDecisionIds: [],
    };

    return new Decision({
      ...defaults,
      ...defaultOverrides,
    });
  }

  with(props: Partial<DecisionProps>): Decision {
    if (this.status === 'published') {
      throw new DecisionStateError('Cannot modify a published decision');
    }
    if (this.status === 'superseded') {
      throw new DecisionStateError('Cannot modify a superseded decision');
    }
    return Decision.create({
      ...this,
      ...props,
    });
  }

  withoutId(): Omit<DecisionProps, "id"> {
    const { id, ...propsWithoutId } = this;
    return propsWithoutId;
  }
}
