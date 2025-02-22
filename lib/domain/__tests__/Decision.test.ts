import { describe, it, expect, beforeAll } from 'vitest'
import { Decision, DecisionProps } from '@/lib/domain/Decision'
import { DecisionStateError, StakeholderError } from '@/lib/domain/DecisionError'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'

describe('Decision Domain Model', () => {
  const defaultProps: DecisionProps = {
    id: 'test-id',
    title: 'Test Decision',
    description: 'Test Description',
    cost: 'low',
    createdAt: new Date(),
    criteria: [],
    options: [],
    reversibility: 'hat',
    stakeholders: [],
    driverStakeholderId: 'driver-1',
    organisationId: 'org-1',
    teamId: 'team-1',
    projectId: 'project-1',
    supportingMaterials: [],
    relationships: []
  }

  describe('Project Ownership', () => {
    it('should always have organisationId, teamId, and projectId', () => {
      const decision = Decision.create(defaultProps)
      expect(decision.organisationId).toBe('org-1')
      expect(decision.teamId).toBe('team-1')
      expect(decision.projectId).toBe('project-1')
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

      const blockingDecision = Decision.create({...defaultProps, id: 'blocking-decision'});
      // Once a decision has a blockedBy relationship, it becomes blocked
      const blockedDecision = baseDecision.with({
        relationships: [
          DecisionRelationship.createBlockedByRelationship(
            baseDecision,
            blockingDecision
          )
        ]
      });
      expect(blockedDecision.status).toBe('blocked');

      // Once a decision gets a publishDate, it becomes published
      const publishedDecision = blockedDecision.with({
        publishDate: new Date()
      });
      expect(publishedDecision.status).toBe('published');

      // Once a decision has a supersededBy relationship, it becomes superseded
      const supercedingDecision = Decision.create({...defaultProps, id: 'superceding-decision'});
      const supersededDecision = publishedDecision.with({
        relationships: [
          DecisionRelationship.createSupersedesRelationship(
            supercedingDecision,
            publishedDecision,
          )
        ]
      });
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

      const withOptions = withMethod.with({ options: ['option1'] })
      expect(withOptions.currentStep.label).toBe('Options')

      const withDecision = withOptions.with({ decision: 'Final decision' })
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
    let decisionA1SupersedesA: DecisionRelationship
    let decisionCIsBlockedByB: DecisionRelationship

    beforeAll(() => {
      decisionA = Decision.create({...defaultProps, id: 'decision-a', title: 'Decision A'})
      decisionA1 = Decision.create({...defaultProps, id: 'decision-a1', title: 'Decision A1'})
      decisionB = Decision.create({...defaultProps, id: 'decision-b', title: 'Decision B'})
      decisionC = Decision.create({...defaultProps, id: 'decision-c', title: 'Decision C'})
      decisionA1SupersedesA = DecisionRelationship.createSupersedesRelationship(
        decisionA1,
        decisionA
      )
      // Decision A1 has 1 relationship as the fromDecision:
      // - (from) A1 supersedes (to) A
      decisionA1 = decisionA1.with({
        relationships: [decisionA1SupersedesA]
      })
      // Decision A gets the same relationship because its the toDecision
      // - (from) A1 supersedes (to) A - gets inverted to: (from) A superceeded_by (to) A1
      decisionA = decisionA.with({
        relationships: [decisionA1SupersedesA]
      })

      decisionCIsBlockedByB = DecisionRelationship.createBlockedByRelationship(
        decisionC,
        decisionB
      )
      // Decision C has 1 relationship as the fromDecision:
      // - (from) C is blocked_by (to) B
      decisionC = decisionC.with({
        relationships: [decisionCIsBlockedByB]
      })
      // Decision B gets the same relationship because its the toDecision
      // - (from) C is blocked_by (to) B - gets inverted to: (from) B blocks (to) C
      decisionB = decisionB.with({
        relationships: [decisionCIsBlockedByB]
      })
    })

    it('should show that A1 supersedes A', () => {
      expect(decisionA1.supersedes.length).toBe(1)
      expect(decisionA1.supersedes[0].fromDecisionId).toBe(decisionA1.id)
      expect(decisionA1.supersedes[0].toDecisionId).toBe(decisionA.id)
    })
    it('(inverted) should show that A is superseded by A1', () => {
      expect(decisionA.supersededBy.length).toBe(1)
      expect(decisionA.supersededBy[0].fromDecisionId).toBe(decisionA.id)
      expect(decisionA.supersededBy[0].toDecisionId).toBe(decisionA1.id)
    })
    it('show A as superceeded', () => {
      expect(decisionA.isSuperseded()).toBe(true)
    })

    it('should show that C is blocked_by B', () => {
      expect(decisionC.blockedBy.length).toBe(1)
      expect(decisionC.blockedBy[0].fromDecisionId).toBe(decisionC.id)
      expect(decisionC.blockedBy[0].toDecisionId).toBe(decisionB.id)
    })
    it('(inverted) should show that B blocks C', () => {
      expect(decisionB.blocks.length).toBe(1)
      expect(decisionB.blocks[0].fromDecisionId).toBe(decisionB.id)
      expect(decisionB.blocks[0].toDecisionId).toBe(decisionC.id)
    })
  })
}) 