import { 
  DecisionWorkflowSteps,
  WorkflowNavigator,
} from '@/lib/domain/Decision';
import { describe, it, expect} from 'vitest'

describe('WorkflowNavigator', () => {
  describe('getStepIndex', () => {
    it('should return correct indices for valid steps', () => {
      expect(WorkflowNavigator.getStepIndex(DecisionWorkflowSteps.IDENTIFY)).toBe(0);
      expect(WorkflowNavigator.getStepIndex(DecisionWorkflowSteps.METHOD)).toBe(1);
      expect(WorkflowNavigator.getStepIndex(DecisionWorkflowSteps.CHOOSE)).toBe(2);
      expect(WorkflowNavigator.getStepIndex(DecisionWorkflowSteps.PUBLISH)).toBe(3);
    });

    it('should throw error for invalid step', () => {
      const invalidStep = { key: 'invalid', label: 'Invalid', icon: DecisionWorkflowSteps.IDENTIFY.icon };
      expect(() => WorkflowNavigator.getStepIndex(invalidStep)).toThrow('Invalid workflow step: invalid');
    });
  });

  describe('step navigation', () => {
    it('should correctly identify first/last steps', () => {
      expect(WorkflowNavigator.isFirstStep(DecisionWorkflowSteps.IDENTIFY)).toBe(true);
      expect(WorkflowNavigator.isFirstStep(DecisionWorkflowSteps.METHOD)).toBe(false);
      expect(WorkflowNavigator.isLastStep(DecisionWorkflowSteps.PUBLISH)).toBe(true);
      expect(WorkflowNavigator.isLastStep(DecisionWorkflowSteps.CHOOSE)).toBe(false);
    });

    it('should return correct previous steps', () => {
      expect(WorkflowNavigator.getPreviousStep(DecisionWorkflowSteps.IDENTIFY)).toBeNull();
      expect(WorkflowNavigator.getPreviousStep(DecisionWorkflowSteps.METHOD)).toEqual(DecisionWorkflowSteps.IDENTIFY);
      expect(WorkflowNavigator.getPreviousStep(DecisionWorkflowSteps.CHOOSE)).toEqual(DecisionWorkflowSteps.METHOD);
      expect(WorkflowNavigator.getPreviousStep(DecisionWorkflowSteps.PUBLISH)).toEqual(DecisionWorkflowSteps.CHOOSE);
    });

    it('should return correct next steps', () => {
      expect(WorkflowNavigator.getNextStep(DecisionWorkflowSteps.IDENTIFY)).toEqual(DecisionWorkflowSteps.METHOD);
      expect(WorkflowNavigator.getNextStep(DecisionWorkflowSteps.METHOD)).toEqual(DecisionWorkflowSteps.CHOOSE);
      expect(WorkflowNavigator.getNextStep(DecisionWorkflowSteps.CHOOSE)).toEqual(DecisionWorkflowSteps.PUBLISH);
      expect(WorkflowNavigator.getNextStep(DecisionWorkflowSteps.PUBLISH)).toBeNull();
    });
  });

  describe('transition validation', () => {
    it('should allow moving one step forward', () => {
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.IDENTIFY, DecisionWorkflowSteps.METHOD)).toBe(true);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.METHOD, DecisionWorkflowSteps.CHOOSE)).toBe(true);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.CHOOSE, DecisionWorkflowSteps.PUBLISH)).toBe(true);
    });

    it('should allow moving one step backward', () => {
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.METHOD, DecisionWorkflowSteps.IDENTIFY)).toBe(true);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.CHOOSE, DecisionWorkflowSteps.METHOD)).toBe(true);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.PUBLISH, DecisionWorkflowSteps.CHOOSE)).toBe(true);
    });

    it('should not allow skipping steps', () => {
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.IDENTIFY, DecisionWorkflowSteps.CHOOSE)).toBe(false);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.METHOD, DecisionWorkflowSteps.PUBLISH)).toBe(false);
      expect(WorkflowNavigator.isValidTransition(DecisionWorkflowSteps.PUBLISH, DecisionWorkflowSteps.IDENTIFY)).toBe(false);
    });
  });
}); 