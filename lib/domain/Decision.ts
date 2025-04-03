import { Search, Settings, Zap, BookOpen, Users } from "lucide-react";
import { SupportingMaterial } from "@/lib/domain/SupportingMaterial";
import { IsArray, IsDate, IsEnum, IsOptional, IsString } from "class-validator";
import {
  StakeholderError,
  DecisionStateError,
} from "@/lib/domain/DecisionError";
import { DocumentReference, doc } from "firebase/firestore";
import { db } from "@/lib/firebase";

/**
 * Represents a step in the decision workflow process.
 * Each step has a unique key, an icon for visual representation,
 * and a display label.
 */
export const DecisionWorkflowSteps = {
  IDENTIFY: { key: "identify", icon: Search, label: "Identify" },
  STAKEHOLDERS: { key: "stakeholders", icon: Users, label: "Stakeholders" },
  METHOD: { key: "method", icon: Settings, label: "Method" },
  CHOOSE: { key: "choose", icon: Zap, label: "Choose" },
  PUBLISH: { key: "publish", icon: BookOpen, label: "Publish" },
} as const;

/**
 * Defines the sequence of steps in the decision workflow.
 * This order is used for navigation and display purposes.
 */
export const DecisionWorkflowStepsSequence = [
  DecisionWorkflowSteps.IDENTIFY,
  DecisionWorkflowSteps.STAKEHOLDERS,
  DecisionWorkflowSteps.METHOD,
  DecisionWorkflowSteps.CHOOSE,
  DecisionWorkflowSteps.PUBLISH,
] as const;

export type DecisionWorkflowStepKey = keyof typeof DecisionWorkflowSteps;
export type DecisionWorkflowStep =
  (typeof DecisionWorkflowSteps)[DecisionWorkflowStepKey];

/**
 * Defines the role responsible for each step in the workflow
 */
export type StepRole = "Driver" | "Decider";
export const StepRoles: Record<DecisionWorkflowStepKey, StepRole> = {
  IDENTIFY: "Driver",
  STAKEHOLDERS: "Driver",
  METHOD: "Driver",
  CHOOSE: "Decider",
  PUBLISH: "Decider",
} as const;

export type DecisionStatus =
  | "in_progress"
  | "blocked"
  | "published"
  | "superseded";
export type DecisionMethod = "accountable_individual" | "consent";
export type StakeholderRole = "decider" | "consulted" | "informed";
export type Cost = "low" | "medium" | "high";
export type Reversibility = "hat" | "haircut" | "tattoo";
export type DecisionRelationshipType =
  | "blocked_by"
  | "supersedes"
  | "blocks"
  | "superseded_by"
  | "did_block"
  | "was_blocked_by";

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

export interface DecisionRelationship {
  targetDecision: DocumentReference;
  targetDecisionTitle: string;
  type: DecisionRelationshipType;
}

export class DecisionRelationshipTools {
  static getTargetDecisionOrganisationId(
    decisionRelationship: DecisionRelationship,
  ): string {
    const pathParts = decisionRelationship.targetDecision.path.split("/");
    const orgIndex = pathParts.indexOf("organisations");
    return orgIndex >= 0 ? pathParts[orgIndex + 1] : "";
  }

  static getInverseRelationshipType(
    type: DecisionRelationshipType,
  ): DecisionRelationshipType {
    const lookupInverse: Record<
      DecisionRelationshipType,
      DecisionRelationshipType
    > = {
      supersedes: "superseded_by",
      blocked_by: "blocks",
      blocks: "blocked_by",
      superseded_by: "supersedes",
      did_block: "was_blocked_by",
      was_blocked_by: "did_block",
    };
    return lookupInverse[type];
  }
}

export type DecisionRelationshipMap = {
  [key: string]: DecisionRelationship;
};

export type DecisionProps = {
  id: string;
  title: string;
  description: string;
  cost: Cost;
  createdAt: Date;
  decision?: string;
  decisionMethod?: string;
  reversibility: Reversibility;
  stakeholders: DecisionStakeholderRole[];
  publishDate?: Date;
  updatedAt?: Date;
  driverStakeholderId: string;
  supportingMaterials?: SupportingMaterial[];
  organisationId: string;
  teamIds: string[];
  projectIds: string[];
  relationships?: DecisionRelationshipMap;
  decisionNotes?: string;
};

export class Decision {
  @IsString()
  readonly id: string;

  @IsString()
  readonly title: string;

  @IsString()
  readonly description: string;

  @IsEnum(["low", "medium", "high"])
  readonly cost: Cost;

  @IsDate()
  readonly createdAt: Date;

  @IsOptional()
  @IsString()
  readonly decision?: string;

  @IsOptional()
  @IsString()
  readonly decisionMethod?: string;

  @IsEnum(["hat", "haircut", "tattoo"])
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

  @IsArray()
  @IsString({ each: true })
  readonly teamIds: string[];

  @IsArray()
  @IsString({ each: true })
  readonly projectIds: string[];

  @IsOptional()
  readonly relationships?: DecisionRelationshipMap;

  @IsOptional()
  @IsString()
  readonly decisionNotes?: string;

  toDocumentReference(): DocumentReference {
    if (!this.organisationId) {
      throw new Error(
        "Cannot create document reference: organisationId is required",
      );
    }
    return doc(db, "organisations", this.organisationId, "decisions", this.id);
  }

  private getRelationshipKey(
    type: DecisionRelationshipType,
    targetDecisionId: string,
  ): string {
    return `${type}_${targetDecisionId}`;
  }

  getRelationshipsByType(
    type: DecisionRelationshipType,
  ): DecisionRelationship[] {
    if (!this.relationships) return [];

    return Object.entries(this.relationships)
      .filter(([, relationship]) => relationship.type === type)
      .map(([, relationship]) => relationship);
  }

  setRelationship(
    type: DecisionRelationshipType,
    targetDecision: Decision,
  ): Decision {
    const key = this.getRelationshipKey(type, targetDecision.id);
    const newRelationship = {
      targetDecision: targetDecision.toDocumentReference(),
      targetDecisionTitle: targetDecision.title,
      type,
    } as DecisionRelationship;

    return this.with({
      relationships: {
        ...this.relationships,
        [key]: newRelationship,
      },
    });
  }

  unsetRelationship(
    type: DecisionRelationshipType,
    targetDecisionId: string,
  ): Decision {
    const key = this.getRelationshipKey(type, targetDecisionId);

    if (!this.relationships?.[key]) {
      return this;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { [key]: _, ...remainingRelationships } = this.relationships;

    return this.with({
      relationships: remainingRelationships,
    });
  }

  get status(): DecisionStatus {
    // Check if superseded
    if (this.getRelationshipsByType("superseded_by").length > 0) {
      return "superseded";
    }

    // Check if published
    if (this.publishDate) {
      return "published";
    }

    // Check if blocked
    if (this.getRelationshipsByType("blocked_by").length > 0) {
      return "blocked";
    }

    // Default state
    return "in_progress";
  }

  get currentStep(): DecisionWorkflowStep {
    if (this.status === "published" || this.status === "superseded") {
      return DecisionWorkflowSteps.PUBLISH;
    }
    if (this.decision) {
      return DecisionWorkflowSteps.CHOOSE;
    }
    if (this.decisionMethod) {
      return DecisionWorkflowSteps.METHOD;
    }
    if (this.decisionStakeholderIds.length > 0) {
      return DecisionWorkflowSteps.STAKEHOLDERS;
    }
    return DecisionWorkflowSteps.IDENTIFY;
  }

  get decisionStakeholderIds(): string[] {
    return this.stakeholders.map((s) => s.stakeholder_id);
  }

  isSuperseded(): boolean {
    return (
      this.status === "superseded" &&
      this.getRelationshipsByType("superseded_by").length > 0
    );
  }

  isBlocked(): boolean {
    return (
      this.status === "blocked" &&
      this.getRelationshipsByType("blocked_by").length > 0
    );
  }

  isPublished(): boolean {
    return this.publishDate !== undefined;
  }

  getSupersedesRelationship(): DecisionRelationship | undefined {
    return this.getRelationshipsByType("supersedes")[0];
  }

  getSupersededByRelationship(): DecisionRelationship | undefined {
    return this.getRelationshipsByType("superseded_by")[0];
  }

  publish(): Decision {
    if (!this.decision) {
      throw new DecisionStateError(
        "Cannot publish a decision without a chosen option",
      );
    }

    if (this.publishDate) {
      throw new DecisionStateError("Decision is already published");
    }

    if (this.isBlocked()) {
      throw new DecisionStateError("Cannot publish a blocked decision");
    }

    if (this.isSuperseded()) {
      throw new DecisionStateError("Cannot publish a superseded decision");
    }

    // Transform blocks relationships to did_block
    let updatedRelationships = { ...this.relationships };
    const blocksRelationships = this.getRelationshipsByType("blocks");

    for (const relationship of blocksRelationships) {
      const targetDecisionId = relationship.targetDecision.id;

      // Remove the old blocks relationship
      const oldKey = this.getRelationshipKey("blocks", targetDecisionId);
      if (updatedRelationships && updatedRelationships[oldKey]) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { [oldKey]: _, ...rest } = updatedRelationships;
        updatedRelationships = rest;
      }

      // Add the new did_block relationship
      const newKey = this.getRelationshipKey("did_block", targetDecisionId);
      updatedRelationships = {
        ...updatedRelationships,
        [newKey]: {
          ...relationship,
          type: "did_block" as DecisionRelationshipType,
        },
      };
    }

    // Create a new decision object directly instead of using with()
    return Decision.create({
      ...this,
      publishDate: new Date(),
      updatedAt: new Date(),
      relationships: updatedRelationships,
    });
  }

  addStakeholder(
    stakeholderId: string,
    role: StakeholderRole = "informed",
  ): Decision {
    if (this.stakeholders.some((s) => s.stakeholder_id === stakeholderId)) {
      throw new StakeholderError(
        `Stakeholder ${stakeholderId} is already part of this decision`,
      );
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
      throw new StakeholderError("Cannot remove the driver stakeholder");
    }

    return this.with({
      stakeholders: this.stakeholders.filter(
        (s) => s.stakeholder_id !== stakeholderId,
      ),
    });
  }

  setDecisionDriver(driverStakeholderId: string): Decision {
    // First ensure the new driver is a stakeholder and update the driverStakeholderId
    const withNewDriver = (
      this.stakeholders.some((s) => s.stakeholder_id === driverStakeholderId)
        ? this
        : this.addStakeholder(driverStakeholderId)
    ).with({ driverStakeholderId });

    // Then remove the old driver from stakeholders list if they're not the new driver
    const oldDriverId = this.driverStakeholderId;
    return oldDriverId && oldDriverId !== driverStakeholderId
      ? withNewDriver.with({
          stakeholders: withNewDriver.stakeholders.filter(
            (s) => s.stakeholder_id !== oldDriverId,
          ),
        })
      : withNewDriver;
  }

  private constructor(props: DecisionProps) {
    this.id = props.id;
    this.title = props.title;
    this.description = props.description;
    this.cost = props.cost;
    this.createdAt = props.createdAt;
    this.decision = props.decision;
    this.decisionMethod = props.decisionMethod;
    this.reversibility = props.reversibility;
    this.stakeholders = props.stakeholders;
    this.publishDate = props.publishDate;
    this.updatedAt = props.updatedAt;
    this.driverStakeholderId = props.driverStakeholderId;
    this.supportingMaterials = props.supportingMaterials || [];
    this.organisationId = props.organisationId;
    this.teamIds = props.teamIds || [];
    this.projectIds = props.projectIds || [];
    this.relationships = props.relationships;
    this.decisionNotes = props.decisionNotes;
    this.validate();
  }

  static create(props: DecisionProps): Decision {
    return new Decision(props);
  }

  static createEmptyDecision(
    defaultOverrides: Partial<DecisionProps> = {},
  ): Decision {
    const now = new Date();
    return Decision.create({
      id:
        Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15),
      title: "",
      description: "",
      cost: "low",
      createdAt: now,
      decision: undefined,
      decisionMethod: undefined,
      reversibility: "hat",
      stakeholders: [],
      driverStakeholderId: "",
      supportingMaterials: [],
      organisationId: "",
      teamIds: [],
      projectIds: [],
      ...defaultOverrides,
    });
  }

  with(props: Partial<DecisionProps>): Decision {
    const newDecision = Decision.create({
      ...this,
      ...props,
      updatedAt: new Date(),
    });

    // Allow relationship changes during publication process
    const isPublishOperation = !this.publishDate && newDecision.publishDate;

    if (
      this.status === "published" &&
      !newDecision.isSuperseded() &&
      !isPublishOperation
    ) {
      throw new DecisionStateError(`Cannot modify published decisions`);
    }

    return newDecision;
  }

  withoutId(): Omit<DecisionProps, "id"> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...rest } = this;
    return rest;
  }

  private validate(): void {
    // Implementation of validation logic
  }
}

/**
 * Provides navigation and state management utilities for the decision workflow.
 * Ensures consistent step transitions and state management across the application.
 */
export class WorkflowNavigator {
  /**
   * Gets the index of a step in the workflow sequence.
   * @throws {Error} If the step is not found in the sequence
   */
  static getStepIndex(step: DecisionWorkflowStep): number {
    const index = DecisionWorkflowStepsSequence.findIndex(
      (s) => s.key === step.key,
    );
    if (index === -1) {
      throw new Error(`Invalid workflow step: ${step.key}`);
    }
    return index;
  }

  /**
   * Gets the previous step in the workflow sequence.
   * @returns The previous step or null if at the start
   */
  static getPreviousStep(
    currentStep: DecisionWorkflowStep,
  ): DecisionWorkflowStep | null {
    const currentIndex = this.getStepIndex(currentStep);
    return currentIndex > 0
      ? DecisionWorkflowStepsSequence[currentIndex - 1]
      : null;
  }

  /**
   * Gets the next step in the workflow sequence.
   * @returns The next step or null if at the end
   */
  static getNextStep(
    currentStep: DecisionWorkflowStep,
  ): DecisionWorkflowStep | null {
    const currentIndex = this.getStepIndex(currentStep);
    return currentIndex < DecisionWorkflowStepsSequence.length - 1
      ? DecisionWorkflowStepsSequence[currentIndex + 1]
      : null;
  }

  /**
   * Checks if the given step is the first in the sequence
   */
  static isFirstStep(step: DecisionWorkflowStep): boolean {
    return this.getStepIndex(step) === 0;
  }

  /**
   * Checks if the given step is the last in the sequence
   */
  static isLastStep(step: DecisionWorkflowStep): boolean {
    return this.getStepIndex(step) === DecisionWorkflowStepsSequence.length - 1;
  }

  /**
   * Validates if a transition between steps is allowed.
   * Only allows moving one step forward or backward.
   */
  static isValidTransition(
    from: DecisionWorkflowStep,
    to: DecisionWorkflowStep,
  ): boolean {
    const fromIndex = this.getStepIndex(from);
    const toIndex = this.getStepIndex(to);
    return toIndex <= fromIndex + 1 && toIndex >= fromIndex - 1;
  }
}
