import {
  Decision,
  DecisionRelationshipType,
  DecisionRelationship,
} from "@decision-copilot/domain/Decision";
import { FirestoreDecisionsRepository } from "@decision-copilot/infrastructure";

export interface SelectedDecisionDetails {
  toDecisionId: string;
  organisationId: string;
}

const decisionRepository = new FirestoreDecisionsRepository();

export function useDecisionRelationships(sourceDecision: Decision) {
  const addRelationship = async (
    targetDetails: SelectedDecisionDetails,
    type: DecisionRelationshipType,
  ) => {
    try {
      // Fetch the actual target decision from Firestore
      const targetDecision = await decisionRepository.getById(
        targetDetails.toDecisionId,
        { organisationId: targetDetails.organisationId },
      );

      if (!targetDecision) {
        throw new Error(
          `Target decision ${targetDetails.toDecisionId} not found`,
        );
      }

      // Create a DecisionRelationship object
      const relationship: DecisionRelationship = {
        targetDecisionPath: targetDecision.getDocumentPath(),
        targetDecisionTitle: targetDecision.title,
        type: type,
      };

      await decisionRepository.addRelationship(sourceDecision, relationship);
    } catch (error) {
      console.error("Error adding relationship:", error);
      throw error;
    }
  };

  const removeRelationship = async (
    type: DecisionRelationshipType,
    targetDecision: Decision,
  ) => {
    try {
      // Create a DecisionRelationship object
      const relationship: DecisionRelationship = {
        targetDecisionPath: targetDecision.getDocumentPath(),
        targetDecisionTitle: targetDecision.title,
        type: type,
      };
      await decisionRepository.removeRelationship(sourceDecision, relationship);
    } catch (error) {
      console.error("Error removing relationship:", error);
      throw error;
    }
  };

  return {
    addRelationship,
    removeRelationship,
  };
}
