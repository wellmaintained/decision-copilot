import { describe, it, expect } from 'vitest'
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
      const baseDecision = Decision.create(defaultProps);
      expect(baseDecision.status).toBe('in_progress');

      // Test published status
      const publishedDecision = Decision.create({
        ...defaultProps,
        publishDate: new Date()
      });
      expect(publishedDecision.status).toBe('published');

      // Test blocked status
      const blockedDecision = Decision.create({
        ...defaultProps,
        relationships: [
          DecisionRelationship.create({
            type: 'blocked_by',
            fromDecisionId: 'other-decision',
            toDecisionId: defaultProps.id,
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      });
      expect(blockedDecision.status).toBe('blocked');

      // Test superseded status
      const supersededDecision = Decision.create({
        ...defaultProps,
        relationships: [
          DecisionRelationship.create({
            type: 'supersedes',
            fromDecisionId: 'new-decision',
            toDecisionId: defaultProps.id,
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      });
      expect(supersededDecision.status).toBe('superseded');
    })

    it('should prioritize superseded status over other statuses', () => {
      const decision = Decision.create({
        ...defaultProps,
        publishDate: new Date(),
        relationships: [
          DecisionRelationship.create({
            type: 'supersedes',
            fromDecisionId: 'new-decision',
            toDecisionId: defaultProps.id,
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      });
      expect(decision.status).toBe('superseded');
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
    it('should correctly check if decision is blocked by another decision', () => {
      const decision = Decision.create({
        ...defaultProps,
        relationships: [
          DecisionRelationship.create({
            type: 'blocked_by',
            fromDecisionId: defaultProps.id,
            toDecisionId: 'blocking-decision',
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      })

      expect(decision.isBlockedBy('blocking-decision')).toBe(true)
      expect(decision.isBlockedBy('non-blocking-decision')).toBe(false)
    })

    it('should correctly determine if decision can proceed based on completed decisions', () => {
      const decision = Decision.create({
        ...defaultProps,
        relationships: [
          DecisionRelationship.create({
            type: 'blocked_by',
            fromDecisionId: defaultProps.id,
            toDecisionId: 'blocking-1',
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          }),
          DecisionRelationship.create({
            type: 'blocked_by',
            fromDecisionId: defaultProps.id,
            toDecisionId: 'blocking-2',
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      })

      expect(decision.canProceed([])).toBe(false)
      expect(decision.canProceed(['blocking-1'])).toBe(false)
      expect(decision.canProceed(['blocking-1', 'blocking-2'])).toBe(true)
    })

    it('should correctly check if decision is superseded', () => {
      const decision = Decision.create({
        ...defaultProps,
        relationships: [
          DecisionRelationship.create({
            type: 'supersedes',
            fromDecisionId: 'new-decision',
            toDecisionId: defaultProps.id,
            createdAt: new Date(),
            fromTeamId: defaultProps.teamId,
            fromProjectId: defaultProps.projectId,
            toTeamId: defaultProps.teamId,
            toProjectId: defaultProps.projectId,
            organisationId: defaultProps.organisationId
          })
        ]
      })

      expect(decision.isSuperseded()).toBe(true)
    })
  })
}) 