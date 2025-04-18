import { describe, it, expect, afterAll, beforeAll, vi } from "vitest";
import { FirestoreDecisionsRepository } from "@/lib/infrastructure/firestoreDecisionsRepository";
import { Decision, DecisionRelationship } from "@/lib/domain/Decision";
import { BASE_TEST_SCOPE, signInTestUser } from "./helpers/firebaseTestHelper";
import { Project } from "@/lib/domain/Project";
import { FirestoreProjectDecisionsRepository } from "../firestoreProjectDecisionsRepository";

describe("FirestoreDecisionsRepository Integration Tests", () => {
  const repository = new FirestoreDecisionsRepository();
  const projectRepository = new FirestoreProjectDecisionsRepository();
  const decisionsToCleanUp: Decision[] = [];
  const projectsToCleanUp: Project[] = [];

  // Add sleep function
  const wait = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

  const createTestProjectAndDecisions = async (
    testName: string,
  ): Promise<Decision[]> => {
    const randomChars = Math.random().toString(36).substring(5, 9);
    const projectId = `test-${testName}-${randomChars}`;
    const teamId = `team-${testName}-${randomChars}`;

    const project = await projectRepository.create(
      Project.create({
        id: projectId,
        name: `Test Project ${testName}`,
        description: `Temporary project for integration tests ${testName}`,
        organisationId: BASE_TEST_SCOPE.organisationId,
      }),
    );

    projectsToCleanUp.push(project);

    const decisionScope = {
      organisationId: project.organisationId,
    };

    // Create empty decision with the organisation ID already set
    const emptyDecision = Decision.createEmptyDecision({
      organisationId: project.organisationId,
    });

    const decisionA = await repository.create(
      emptyDecision
        .with({
          title: "Decision A",
          teamIds: [teamId],
          projectIds: [project.id],
        })
        .withoutId(),
      decisionScope,
    );

    decisionsToCleanUp.push(decisionA);

    const decisionA1 = await repository.create(
      emptyDecision
        .with({
          title: "Decision A1",
          teamIds: [teamId],
          projectIds: [project.id],
        })
        .withoutId(),
      decisionScope,
    );

    decisionsToCleanUp.push(decisionA1);

    const decisionB = await repository.create(
      emptyDecision
        .with({
          title: "Decision B",
          teamIds: [teamId],
          projectIds: [project.id],
        })
        .withoutId(),
      decisionScope,
    );

    decisionsToCleanUp.push(decisionB);

    // Add a delay to ensure data is properly written to Firestore
    await wait(500);

    return [decisionA, decisionA1, decisionB];
  };

  const createProjectAndTeam = async (
    testName: string,
  ): Promise<[Project, string]> => {
    const randomChars = Math.random().toString(36).substring(5, 9);
    const projectId = `test-${testName}-${randomChars}`;
    const teamId = `team-${testName}-${randomChars}`;

    const project = await projectRepository.create(
      Project.create({
        id: projectId,
        name: `Test Project ${testName}`,
        description: `Temporary project for integration tests ${testName}`,
        organisationId: BASE_TEST_SCOPE.organisationId,
      }),
    );

    projectsToCleanUp.push(project);

    return [project, teamId];
  };

  beforeAll(async () => {
    await signInTestUser();
  });

  afterAll(async () => {
    for (const decision of decisionsToCleanUp) {
      await repository.delete(decision.id, {
        organisationId: decision.organisationId,
      });
    }
    for (const project of projectsToCleanUp) {
      await projectRepository.delete(project);
    }
  });

  describe("subscribeToOne", () => {
    it("should receive updates when a decision title is modified", async () => {
      const onError = vi.fn();
      let updatesReceived = 0;
      const decisionsReceived: Map<number, Decision | null> = new Map();
      const [decisionA] = await createTestProjectAndDecisions("subscribeToOne");

      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (updatesReceived === 2) {
            unsubscribe();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToOne(
          decisionA,
          (decision) => {
            updatesReceived++;
            decisionsReceived.set(updatesReceived, decision);

            // Wait until we've received the initial update before making any changes
            if (updatesReceived === 1) {
              // Make a change to the decision title to trigger an update
              repository.update(
                decisionA.with({ title: decisionA.title + " Updated" }),
              );
            }

            checkIfAllUpdatesReceived();
          },
          onError,
        );
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled();

      // Initial decision had the original title
      const initialDecision = decisionsReceived.get(1);
      expect(initialDecision?.title).toBe("Decision A");

      // Updated decision has the new title
      const updatedDecision = decisionsReceived.get(2);
      expect(updatedDecision?.title).toBe("Decision A Updated");
    });

    it("should receive updates when a relationship is added or removed", async () => {
      const onError = vi.fn();
      let updatesReceived = 0;
      let hasAddedRelationship = false;
      let hasRemovedRelationship = false;
      const decisionsReceived: Map<number, Decision | null> = new Map();
      const [decisionA, decisionB] = await createTestProjectAndDecisions(
        "subscribeToOne-relationship",
      );

      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (hasAddedRelationship && hasRemovedRelationship) {
            unsubscribe();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToOne(
          decisionA,
          async (decision) => {
            updatesReceived++;
            console.log(`[subscribeToOne] Received update ${updatesReceived}`);
            decisionsReceived.set(updatesReceived, decision);

            // Wait until we've received the initial update before making any changes
            if (updatesReceived === 1) {
              console.log("[subscribeToOne] Adding relationship");
              await repository.addRelationship(decisionA, {
                targetDecision: decisionB.toDocumentReference(),
                targetDecisionTitle: decisionB.title,
                type: "blocked_by",
              } as DecisionRelationship);
              console.log("[subscribeToOne] Relationship added");
            }

            // Check if the relationship was added
            const currentRelationships =
              decision?.getRelationshipsByType("blocked_by");
            console.log(
              `[subscribeToOne] Update ${updatesReceived} - blocked_by relationships: ${currentRelationships?.length}`,
            );

            if (!hasAddedRelationship && currentRelationships?.length === 1) {
              hasAddedRelationship = true;
              console.log("[subscribeToOne] Removing relationship");
              await repository.removeRelationship(decisionA, {
                targetDecision: decisionB.toDocumentReference(),
                targetDecisionTitle: decisionB.title,
                type: "blocked_by",
              } as DecisionRelationship);
              console.log("[subscribeToOne] Relationship removed");
            }

            if (hasAddedRelationship && currentRelationships?.length === 0) {
              hasRemovedRelationship = true;
            }

            checkIfAllUpdatesReceived();
          },
          onError,
        );
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled();

      // Find the update where the relationship was added
      const addedRelationshipUpdate = Array.from(
        decisionsReceived.entries(),
      ).find(
        ([, decision]) =>
          decision?.getRelationshipsByType("blocked_by").length === 1,
      );
      expect(addedRelationshipUpdate).toBeDefined();
      const [, decisionWithRelationship] = addedRelationshipUpdate!;
      expect(
        decisionWithRelationship?.getRelationshipsByType("blocked_by")[0]
          .targetDecision.id,
      ).toBe(decisionB.id);
      expect(
        decisionWithRelationship?.getRelationshipsByType("blocked_by")[0]
          .targetDecisionTitle,
      ).toBe(decisionB.title);

      // Find the update where the relationship was removed
      const removedRelationshipUpdate = Array.from(
        decisionsReceived.entries(),
      ).find(
        ([, decision]) =>
          decision?.getRelationshipsByType("blocked_by").length === 0,
      );
      expect(removedRelationshipUpdate).toBeDefined();
    }, 20000);
  });

  describe("subscribeToAll", () => {
    it("should receive updates when multiple decision titles are modified", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [decisionA, _, decisionB] =
        await createTestProjectAndDecisions("subscribeToAll");
      const testProjectScope = {
        organisationId: decisionA.organisationId,
      };

      const onError = vi.fn();
      let updatesReceived = 0;
      const decisionsReceived: Map<number, Decision[]> = new Map();

      // Create a promise that resolves when we get both the initial and updated decisions
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (updatesReceived === 3) {
            unsubscribe();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToAll(
          (decisions) => {
            updatesReceived++;
            decisionsReceived.set(updatesReceived, decisions);

            // Wait until we've received the initial update before making any changes
            if (updatesReceived === 1) {
              // Make a change to the decision A
              repository.update(
                decisionA.with({ title: decisionA.title + " Updated" }),
              );
            }

            // Wait until we've received the second update before making any changes
            if (updatesReceived === 2) {
              // Make a change to the decision B
              repository.update(
                decisionB.with({ title: decisionB.title + " Updated" }),
              );
            }

            checkIfAllUpdatesReceived();
          },
          onError,
          testProjectScope,
        );
      });

      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled();

      // The first update should contain the initial decisions titles
      const initialDecision = decisionsReceived
        .get(1)
        ?.find((d) => d.id === decisionA.id);
      expect(initialDecision?.title).toBe("Decision A");

      // The second update should contain the updated decision A title
      const updatedDecision = decisionsReceived
        .get(2)
        ?.find((d) => d.id === decisionA.id);
      expect(updatedDecision?.title).toBe("Decision A Updated");

      // The third update should contain the updated decision B title
      const updatedDecisionB = decisionsReceived
        .get(3)
        ?.find((d) => d.id === decisionB.id);
      expect(updatedDecisionB?.title).toBe("Decision B Updated");
    });

    it("should receive to both decisions on both sides of a relationship when a relationship is added or removed", async () => {
      const onError = vi.fn();
      let updatesReceived = 0;
      let hasAddedRelationship = false;
      let hasRemovedRelationship = false;
      const decisionsReceived: Map<number, Decision[]> = new Map();
      const [decisionA, decisionB] = await createTestProjectAndDecisions(
        "subscribeToAll-relationship",
      );

      // Create a promise that resolves when we get both the initial and updated decision
      const allUpdatesReceived = new Promise<void>((resolve) => {
        const checkIfAllUpdatesReceived = () => {
          if (hasAddedRelationship && hasRemovedRelationship) {
            unsubscribe();
            resolve();
          }
        };

        // Subscribe to changes
        const unsubscribe = repository.subscribeToAll(
          async (decisions) => {
            updatesReceived++;
            console.log(`[subscribeToAll] Received update ${updatesReceived}`);
            decisionsReceived.set(updatesReceived, decisions);

            const currentDecisionA = decisions.find(
              (d) => d.id === decisionA.id,
            );
            const currentDecisionB = decisions.find(
              (d) => d.id === decisionB.id,
            );

            console.log(
              `[subscribeToAll] Update ${updatesReceived} - Decision A blocked_by relationships: ${currentDecisionA?.getRelationshipsByType("blocked_by").length}`,
            );
            console.log(
              `[subscribeToAll] Update ${updatesReceived} - Decision B blocks relationships: ${currentDecisionB?.getRelationshipsByType("blocks").length}`,
            );

            // Wait until we've received the initial update before making any changes
            if (updatesReceived === 1) {
              console.log("[subscribeToAll] Adding relationship");
              await repository.addRelationship(decisionA, {
                targetDecision: decisionB.toDocumentReference(),
                targetDecisionTitle: decisionB.title,
                type: "blocked_by",
              } as DecisionRelationship);
              console.log("[subscribeToAll] Relationship added");
            }

            // Check if both relationships have been added
            if (
              !hasAddedRelationship &&
              currentDecisionA?.getRelationshipsByType("blocked_by").length ===
                1 &&
              currentDecisionB?.getRelationshipsByType("blocks").length === 1
            ) {
              hasAddedRelationship = true;
              console.log("[subscribeToAll] Removing relationship");
              await repository.removeRelationship(decisionA, {
                targetDecision: decisionB.toDocumentReference(),
                targetDecisionTitle: decisionB.title,
                type: "blocked_by",
              } as DecisionRelationship);
              console.log("[subscribeToAll] Relationship removed");
            }

            // Check if both relationships have been removed
            if (
              hasAddedRelationship &&
              currentDecisionA?.getRelationshipsByType("blocked_by").length ===
                0 &&
              currentDecisionB?.getRelationshipsByType("blocks").length === 0
            ) {
              hasRemovedRelationship = true;
            }

            checkIfAllUpdatesReceived();
          },
          onError,
          {
            organisationId: decisionA.organisationId,
          },
        );
      });

      // Wait for both updates to be received
      await allUpdatesReceived;

      expect(onError).not.toHaveBeenCalled();

      // Find the update where both relationships were added
      const addedRelationshipUpdate = Array.from(
        decisionsReceived.entries(),
      ).find(([, decisions]) => {
        const foundDecisionA = decisions.find((d) => d.id === decisionA.id);
        const foundDecisionB = decisions.find((d) => d.id === decisionB.id);
        return (
          foundDecisionA?.getRelationshipsByType("blocked_by").length === 1 &&
          foundDecisionB?.getRelationshipsByType("blocks").length === 1
        );
      });
      expect(addedRelationshipUpdate).toBeDefined();
      const [, decisionsWithRelationship] = addedRelationshipUpdate!;
      const decisionAWithRelationship = decisionsWithRelationship.find(
        (d) => d.id === decisionA.id,
      );
      const decisionBWithRelationship = decisionsWithRelationship.find(
        (d) => d.id === decisionB.id,
      );
      expect(
        decisionAWithRelationship?.getRelationshipsByType("blocked_by")[0]
          .targetDecision.id,
      ).toBe(decisionB.id);
      expect(
        decisionAWithRelationship?.getRelationshipsByType("blocked_by")[0]
          .targetDecisionTitle,
      ).toBe(decisionB.title);
      expect(
        decisionBWithRelationship?.getRelationshipsByType("blocks")[0]
          .targetDecision.id,
      ).toBe(decisionA.id);
      expect(
        decisionBWithRelationship?.getRelationshipsByType("blocks")[0]
          .targetDecisionTitle,
      ).toBe(decisionA.title);

      // Find the update where both relationships were removed
      const removedRelationshipUpdate = Array.from(
        decisionsReceived.entries(),
      ).find(([, decisions]) => {
        const foundDecisionA = decisions.find((d) => d.id === decisionA.id);
        const foundDecisionB = decisions.find((d) => d.id === decisionB.id);
        return (
          foundDecisionA?.getRelationshipsByType("blocked_by").length === 0 &&
          foundDecisionB?.getRelationshipsByType("blocks").length === 0
        );
      });
      expect(removedRelationshipUpdate).toBeDefined();
    }, 30000);
  });

  describe("newline preservation", () => {
    it("should preserve empty lines in markdown content", async () => {
      const [project, teamId] = await createProjectAndTeam(
        "newlinePreservation",
      );
      const decisionScope = {
        organisationId: project.organisationId,
      };

      // Create an empty decision with the organisation ID
      const emptyDecision = Decision.createEmptyDecision({
        organisationId: project.organisationId,
      });

      // Create a decision with markdown content containing multiple empty lines
      const markdownWithEmptyLines = `# Title

This is a paragraph.


This is another paragraph after two empty lines.

* List item 1

* List item 2 after an empty line`;

      const decision = await repository.create(
        emptyDecision
          .with({
            title: "Decision with empty lines",
            description: markdownWithEmptyLines,
            teamIds: [teamId],
            projectIds: [project.id],
          })
          .withoutId(),
        decisionScope,
      );

      decisionsToCleanUp.push(decision);

      // Add a delay to ensure data is properly written to Firestore
      await wait(500);

      // Retrieve the decision and check if empty lines are preserved
      const retrievedDecision = await repository.getById(
        decision.id,
        decisionScope,
      );

      expect(retrievedDecision.description).toBe(markdownWithEmptyLines);

      // Specifically check for the double newlines
      expect(retrievedDecision.description).toContain("paragraph.\n\n\nThis");
      expect(retrievedDecision.description).toContain("item 1\n\n* List");
    });
  });

  describe("Relationship Management", () => {
    it("should add and remove relationships correctly", async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [decisionA, _, decisionB] = await createTestProjectAndDecisions(
        "relationshipManagement",
      );
      const testProjectScope = {
        organisationId: decisionA.organisationId,
      };

      // Add a relationship
      await repository.addRelationship(decisionA, {
        targetDecision: decisionB.toDocumentReference(),
        targetDecisionTitle: decisionB.title,
        type: "blocked_by",
      } as DecisionRelationship);

      // Verify the relationship was added
      const decisionWithRelationship = await repository.getById(
        decisionA.id,
        testProjectScope,
      );
      const relationships =
        decisionWithRelationship.getRelationshipsByType("blocked_by");
      expect(relationships).toHaveLength(1);
      expect(relationships[0].targetDecision.id).toBe(decisionB.id);
      expect(relationships[0].targetDecisionTitle).toBe("Decision B");

      // Verify the inverse relationship was added
      const targetDecision = await repository.getById(
        decisionB.id,
        testProjectScope,
      );
      const inverseRelationships =
        targetDecision.getRelationshipsByType("blocks");
      expect(inverseRelationships).toHaveLength(1);
      expect(inverseRelationships[0].targetDecision.id).toBe(decisionA.id);
      expect(inverseRelationships[0].targetDecisionTitle).toBe("Decision A");

      // Remove the relationship
      await repository.removeRelationship(decisionA, {
        targetDecision: decisionB.toDocumentReference(),
        targetDecisionTitle: decisionB.title,
        type: "blocked_by",
      } as DecisionRelationship);

      // Verify the relationship was removed
      const decisionWithoutRelationship = await repository.getById(
        decisionA.id,
        testProjectScope,
      );
      expect(
        decisionWithoutRelationship.getRelationshipsByType("blocked_by"),
      ).toHaveLength(0);

      // Verify the inverse relationship was removed
      const targetDecisionAfterRemoval = await repository.getById(
        decisionB.id,
        testProjectScope,
      );
      expect(
        targetDecisionAfterRemoval.getRelationshipsByType("blocks"),
      ).toHaveLength(0);
    }, 30000);

    it("should update bidirectional relationships when publishing a decision", async () => {
      // Create test decisions
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const [decisionA, _, decisionB] = await createTestProjectAndDecisions(
        "relationshipPublishing",
      );
      const testProjectScope = {
        organisationId: decisionA.organisationId,
      };

      // Add a blocks relationship
      await repository.addRelationship(decisionA, {
        targetDecision: decisionB.toDocumentReference(),
        targetDecisionTitle: decisionB.title,
        type: "blocks",
      } as DecisionRelationship);

      // Publish decision A
      await repository.publish(decisionA);

      // Verify the relationship was transformed on decision A
      const updatedDecisionA = await repository.getById(
        decisionA.id,
        testProjectScope,
      );
      const relationshipsA =
        updatedDecisionA.getRelationshipsByType("did_block");
      expect(relationshipsA).toHaveLength(1);
      expect(relationshipsA[0].targetDecision.id).toBe(decisionB.id);
      expect(relationshipsA[0].targetDecisionTitle).toBe("Decision B");

      // Verify the inverse relationship was transformed on decision B
      const updatedDecisionB = await repository.getById(
        decisionB.id,
        testProjectScope,
      );
      const relationshipsB =
        updatedDecisionB.getRelationshipsByType("was_blocked_by");
      expect(relationshipsB).toHaveLength(1);
      expect(relationshipsB[0].targetDecision.id).toBe(decisionA.id);
      expect(relationshipsB[0].targetDecisionTitle).toBe("Decision A");
    }, 10000);
  });
});
