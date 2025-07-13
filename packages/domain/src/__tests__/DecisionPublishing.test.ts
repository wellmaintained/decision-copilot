import { describe, it, expect } from "vitest";
import { Decision, DecisionProps, DecisionRelationshipTools } from "../Decision";
import { DecisionStateError } from "../DecisionError";

describe("Decision Publishing", () => {
  const defaultProps: DecisionProps = {
    id: "test-id",
    title: "Test Decision",
    description: "Test Description",
    cost: "low",
    createdAt: new Date(),
    reversibility: "hat",
    stakeholders: [{ stakeholder_id: "decider-1", role: "decider" }],
    driverStakeholderId: "decider-1",
    organisationId: "org-1",
    teamIds: ["team-1"],
    projectIds: ["project-1"],
    supportingMaterials: [],
    relationships: {},
  };

  describe("publish", () => {
    it("should successfully publish a valid decision", () => {
      const decision = Decision.create({
        ...defaultProps,
        decision: "option-a",
        decisionMethod: "consent",
      });

      const publishedDecision = decision.publish();

      expect(publishedDecision.status).toBe("published");
      expect(publishedDecision.publishDate).toBeDefined();
      expect(publishedDecision.currentStep.key).toBe("publish");
    });

    it("should set publishDate to current timestamp when publishing", () => {
      const now = new Date();
      const decision = Decision.create({
        ...defaultProps,
        decision: "option-a",
        decisionMethod: "consent",
      });

      const publishedDecision = decision.publish();

      expect(publishedDecision.publishDate).toBeInstanceOf(Date);
      expect(publishedDecision.publishDate!.getTime()).toBeGreaterThanOrEqual(
        now.getTime(),
      );
      expect(publishedDecision.publishDate!.getTime()).toBeLessThanOrEqual(
        new Date().getTime(),
      );
    });

    it("should throw error when publishing a decision without a chosen option", () => {
      const decision = Decision.create({
        ...defaultProps,
        decisionMethod: "consent",
      });

      expect(() => decision.publish()).toThrow(DecisionStateError);
    });

    it("should throw error when publishing an already published decision", () => {
      const decision = Decision.create({
        ...defaultProps,
        decision: "option-a",
        decisionMethod: "consent",
        publishDate: new Date(),
      });

      expect(() => decision.publish()).toThrow(DecisionStateError);
    });

    it("should throw error when publishing a blocked decision", () => {
      const blockingDecision = Decision.create({
        ...defaultProps,
        id: "blocking-decision",
        title: "Blocking Decision",
      });

      const decision = Decision.create({
        ...defaultProps,
        decision: "option-a",
        decisionMethod: "consent",
      }).setRelationship("blocked_by", blockingDecision);

      expect(() => decision.publish()).toThrow(DecisionStateError);
    });

    it("should throw error when publishing a superseded decision", () => {
      const supersedingDecision = Decision.create({
        ...defaultProps,
        id: "superseding-decision",
        title: "Superseding Decision",
      });

      const decision = Decision.create({
        ...defaultProps,
        decision: "option-a",
        decisionMethod: "consent",
      }).setRelationship("superseded_by", supersedingDecision);

      expect(() => decision.publish()).toThrow(DecisionStateError);
    });
  });

  describe("relationship transitions on publish", () => {
    it("should transform blocks relationships to did_block when a decision is published", () => {
      // Create the decisions
      const decisionA = Decision.create({
        ...defaultProps,
        id: "decision-a",
        title: "Decision A",
        decision: "option-a",
        decisionMethod: "consent",
      });

      const decisionB = Decision.create({
        ...defaultProps,
        id: "decision-b",
        title: "Decision B",
      });

      // Set up the blocking relationship: A blocks B
      const aBlocksB = decisionA.setRelationship("blocks", decisionB);
      const bBlockedByA = decisionB.setRelationship("blocked_by", decisionA);

      // Verify initial relationship
      expect(aBlocksB.getRelationshipsByType("blocks")).toHaveLength(1);
      expect(bBlockedByA.getRelationshipsByType("blocked_by")).toHaveLength(1);

      // Publish decision A
      const publishedA = aBlocksB.publish();

      // Check that the relationship type has changed
      expect(publishedA.getRelationshipsByType("blocks")).toHaveLength(0);
      expect(publishedA.getRelationshipsByType("did_block")).toHaveLength(1);

      // Verify the content of the relationship
      const didBlockRelationships =
        publishedA.getRelationshipsByType("did_block");
      expect(DecisionRelationshipTools.getTargetDecisionId(didBlockRelationships[0])).toBe("decision-b");
      expect(didBlockRelationships[0].targetDecisionTitle).toBe("Decision B");
    });

    it("should transform blocked_by relationships to was_blocked_by when the blocking decision is published", () => {
      // Create the decisions
      const decisionA = Decision.create({
        ...defaultProps,
        id: "decision-a",
        title: "Decision A",
        decision: "option-a",
        decisionMethod: "consent",
      });

      const decisionB = Decision.create({
        ...defaultProps,
        id: "decision-b",
        title: "Decision B",
      });

      // Set up the blocking relationship: A blocks B
      const aBlocksB = decisionA.setRelationship("blocks", decisionB);
      const bBlockedByA = decisionB.setRelationship("blocked_by", decisionA);

      // Publish decision A - this should update its relationship to did_block
      const publishedA = aBlocksB.publish();
      expect(publishedA.getRelationshipsByType("did_block")).toHaveLength(1);

      // After A is published, B should have relationship updated from blocked_by to was_blocked_by
      // In a real application, this would be done by repository logic
      // Here we manually update the relationship to simulate repository logic
      const updatedB = bBlockedByA.with({
        relationships: {
          ...bBlockedByA.relationships,
          ["blocked_by_" + decisionA.id]: {
            targetDecisionPath:
              bBlockedByA.relationships!["blocked_by_" + decisionA.id]
                .targetDecisionPath,
            targetDecisionTitle:
              bBlockedByA.relationships!["blocked_by_" + decisionA.id]
                .targetDecisionTitle,
            type: "was_blocked_by",
          },
        },
      });

      // Check the updated relationships
      expect(updatedB.getRelationshipsByType("blocked_by")).toHaveLength(0);
      expect(updatedB.getRelationshipsByType("was_blocked_by")).toHaveLength(1);

      // Verify that B is no longer blocked
      expect(updatedB.isBlocked()).toBe(false);
    });

    it("should allow publishing a decision that was previously blocked after the blocking decision is published", () => {
      // Create the decisions
      const decisionA = Decision.create({
        ...defaultProps,
        id: "decision-a",
        title: "Decision A",
        decision: "option-a",
        decisionMethod: "consent",
      });

      const decisionB = Decision.create({
        ...defaultProps,
        id: "decision-b",
        title: "Decision B",
        decision: "option-b",
        decisionMethod: "consent",
      });

      // Set up the blocking relationship: A blocks B
      const aBlocksB = decisionA.setRelationship("blocks", decisionB);
      const bBlockedByA = decisionB.setRelationship("blocked_by", decisionA);

      // B is blocked and should not be publishable
      expect(() => bBlockedByA.publish()).toThrow(DecisionStateError);

      // Publish decision A - this should update its relationship to did_block
      const publishedA = aBlocksB.publish();
      expect(publishedA.getRelationshipsByType("did_block")).toHaveLength(1);

      // After A is published, B should have relationship updated from blocked_by to was_blocked_by
      // In a real application, this would be done by repository logic
      // Here we manually update the relationship to simulate repository logic
      const updatedB = bBlockedByA.with({
        relationships: {
          ...bBlockedByA.relationships,
          ["blocked_by_" + decisionA.id]: {
            targetDecisionPath:
              bBlockedByA.relationships!["blocked_by_" + decisionA.id]
                .targetDecisionPath,
            targetDecisionTitle:
              bBlockedByA.relationships!["blocked_by_" + decisionA.id]
                .targetDecisionTitle,
            type: "was_blocked_by",
          },
        },
      });

      // B should now be publishable
      const publishedB = updatedB.publish();
      expect(publishedB.status).toBe("published");
    });
  });
});
