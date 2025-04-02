import { describe, it, expect, beforeAll } from 'vitest'
import { Decision, DecisionProps, DecisionRelationship, DecisionRelationshipTools } from '@/lib/domain/Decision'
import { DecisionStateError, StakeholderError } from '@/lib/domain/DecisionError'
import { DocumentReference } from 'firebase/firestore'

describe('Decision Domain Model', () => {
  const defaultProps: DecisionProps = {
    id: 'test-id',
    title: 'Test Decision',
    description: 'Test Description',
    cost: 'low',
    createdAt: new Date(),
    reversibility: 'hat',
    stakeholders: [],
    driverStakeholderId: 'driver-1',
    organisationId: 'org-1',
    teamIds: ['team-1'],
    projectIds: ['project-1'],
    supportingMaterials: [],
    relationships: {}
  }

  describe('Project Ownership', () => {
    it('should always have organisationId, teamIds, and projectIds', () => {
      const decision = Decision.create(defaultProps)
      expect(decision.organisationId).toBe('org-1')
      expect(decision.teamIds).toContain('team-1')
      expect(decision.projectIds).toContain('project-1')
    })
  })

  describe('Driver Stakeholder Management', () => {
    it('should require exactly one driver stakeholder', () => {
      const decision = Decision.create(defaultProps)
      expect(decision.driverStakeholderId).toBe('driver-1')
    })

    it('should throw error when attempting to remove the driver stakeholder', () => {
      const decision = Decision.create({
        ...defaultProps,
        stakeholders: [
          { stakeholder_id: 'driver-1', role: 'decider' }
        ]
      })

      expect(() => {
        decision.removeStakeholder('driver-1')
      }).toThrow(StakeholderError)
    })
  })

  describe('Stakeholder Role Management', () => {
    it('should throw error when adding the same stakeholder twice', () => {
      const decision = Decision.create({
        ...defaultProps,
        stakeholders: [
          { stakeholder_id: 'stakeholder-1', role: 'consulted' }
        ]
      })

      expect(() => {
        decision.addStakeholder('stakeholder-1', 'decider')
      }).toThrow(StakeholderError)
    })
  })

  describe('Decision State Management', () => {
    it('should compute status correctly based on relationships and publishDate', () => {
      const baseDecision = Decision.create({...defaultProps, id: 'base-decision'});
      expect(baseDecision.status).toBe('in_progress');

      const blockingDecision = Decision.create({...defaultProps, id: 'blocking-decision', title: 'Blocking Decision'});
      // Once a decision has a blockedBy relationship, it becomes blocked
      const blockedDecision = baseDecision.setRelationship('blocked_by', blockingDecision);
      expect(blockedDecision.status).toBe('blocked');

      // Once a decision gets a publishDate, it becomes published
      const publishedDecision = blockedDecision.with({
        publishDate: new Date()
      });
      expect(publishedDecision.status).toBe('published');

      // Once a decision has a supersededBy relationship, it becomes superseded
      const supercedingDecision = Decision.create({...defaultProps, id: 'superceding-decision', title: 'Superceding Decision'});
      const supersededDecision = publishedDecision.setRelationship('superseded_by', supercedingDecision);
      expect(supersededDecision.status).toBe('superseded');
    })

    it('should throw error when modifying published decisions', () => {
      const publishedDecision = Decision.create({
        ...defaultProps,
        publishDate: new Date()
      });

      expect(() => {
        publishedDecision.with({ title: 'New Title' })
      }).toThrow(DecisionStateError)
    });
  })

  describe('Workflow Steps', () => {
    it('should follow the correct workflow order', () => {
      const decision = Decision.create(defaultProps)
      expect(decision.currentStep.label).toBe('Identify')

      const withMethod = decision.with({ decisionMethod: 'consent' })
      expect(withMethod.currentStep.label).toBe('Method')

      const withDecision = withMethod.with({ decision: 'Final decision' })
      expect(withDecision.currentStep.label).toBe('Choose')

      const published = withDecision.with({ publishDate: new Date() })
      expect(published.currentStep.label).toBe('Publish')
    })
  })

  describe('Relationship Queries', () => {
    let decisionA: Decision
    let decisionA1: Decision
    let decisionB: Decision
    let decisionC: Decision

    beforeAll(() => {
      decisionA = Decision.create({...defaultProps, id: 'decision-a', title: 'Decision A'})
      decisionA1 = Decision.create({...defaultProps, id: 'decision-a1', title: 'Decision A1'})
      decisionB = Decision.create({...defaultProps, id: 'decision-b', title: 'Decision B'})
      decisionC = Decision.create({...defaultProps, id: 'decision-c', title: 'Decision C'})
    })

    it('should manage supersedes relationships correctly', () => {
      // A1 supersedes A
      const updatedA1 = decisionA1.setRelationship('supersedes', decisionA);
      const relationships = updatedA1.getRelationshipsByType('supersedes');
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].type).toBe('supersedes');
      expect(relationships[0].targetDecision.id).toBe('decision-a');
      expect(relationships[0].targetDecisionTitle).toBe('Decision A');
    })

    it('should manage blocked_by relationships correctly', () => {
      // C is blocked by B
      const updatedC = decisionC.setRelationship('blocked_by', decisionB);
      const relationships = updatedC.getRelationshipsByType('blocked_by');
      
      expect(relationships).toHaveLength(1);
      expect(relationships[0].type).toBe('blocked_by');
      expect(relationships[0].targetDecision.id).toBe('decision-b');
      expect(relationships[0].targetDecisionTitle).toBe('Decision B');
    })

    it('should remove relationships correctly', () => {
      // Add and then remove a relationship
      const withRelationship = decisionA.setRelationship('blocked_by', decisionB);
      expect(withRelationship.getRelationshipsByType('blocked_by')).toHaveLength(1);

      const withoutRelationship = withRelationship.unsetRelationship('blocked_by', decisionB.id);
      expect(withoutRelationship.getRelationshipsByType('blocked_by')).toHaveLength(0);
    })

    it('should handle multiple relationships of the same type', () => {
      // C is blocked by both A and B
      const blockedByA = decisionC.setRelationship('blocked_by', decisionA);
      const blockedByBoth = blockedByA.setRelationship('blocked_by', decisionB);
      
      const relationships = blockedByBoth.getRelationshipsByType('blocked_by');
      expect(relationships).toHaveLength(2);
      expect(relationships.map(r => r.targetDecision.id).sort()).toEqual(['decision-a', 'decision-b'].sort());
    })

    it('should extract organisation ID from relationship target path', () => {
      const mockDocRef = {
        id: 'decision-x',
        path: 'organisations/org-123/decisions/decision-x'
      } as DocumentReference;

      const relationship = {
        targetDecision: mockDocRef,
        targetDecisionTitle: 'Test Decision',
        type: 'blocks'
      } as DecisionRelationship;

      expect(DecisionRelationshipTools.getTargetDecisionOrganisationId(relationship)).toBe('org-123');
    });

    it('should handle missing segments in relationship target path', () => {
      const mockDocRef = {
        id: 'decision-x',
        path: 'some/invalid/path'
      } as DocumentReference;

      const relationship = {
        targetDecision: mockDocRef,
        targetDecisionTitle: 'Test Decision',
        type: 'blocks'
      } as DecisionRelationship;

      expect(DecisionRelationshipTools.getTargetDecisionOrganisationId(relationship)).toBe('');
    });
  })
}) 