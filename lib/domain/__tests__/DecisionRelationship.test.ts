import { describe, it, expect } from 'vitest'
import { Decision } from '@/lib/domain/Decision'
import { DecisionRelationship } from '@/lib/domain/DecisionRelationship'
import { DecisionDependencyError } from '@/lib/domain/DecisionError'

describe('DecisionRelationship Domain Model', () => {
  const emptyDecision = Decision.createEmptyDecision({
    id: 'empty-decision-1',
    teamId: 'team-1',
    projectId: 'project-1',
    organisationId: 'org-1'
  });

  describe('Creating Blocking Relationships', () => {
    it('should create a blocking relationship between two decisions', () => {
      const blockingDecision = emptyDecision.with({
        id: 'blocking-decision'
      })
      const blockedDecision = emptyDecision.with({
        id: 'blocked-decision'
      })

      const relationship = DecisionRelationship.createBlockedByRelationship(
        blockedDecision,
        blockingDecision,
      )

      expect(relationship.organisationId).toBe('org-1')
      expect(relationship.fromDecisionId).toBe('blocked-decision')
      expect(relationship.fromTeamId).toBe('team-1')
      expect(relationship.fromProjectId).toBe('project-1')
      expect(relationship.type).toBe('blocked_by')
      expect(relationship.toDecisionId).toBe('blocking-decision')
      expect(relationship.toTeamId).toBe('team-1')
      expect(relationship.toProjectId).toBe('project-1')
    })

    it('should throw error when attempting self-blocking', () => {
      const decision1 = emptyDecision.with({id: "decision-1"})
      expect(() => {
        DecisionRelationship.createBlockedByRelationship(decision1, decision1)
      }).toThrow(DecisionDependencyError)
    })

    it('should throw error when decisions are from different organisations', () => {
      const blockingDecision = emptyDecision.with({
        id: 'blocking-decision',
        organisationId: 'org-1'
      })
      const blockedDecision = emptyDecision.with({
        id: 'blocked-decision',
        organisationId: 'org-2'
      })

      expect(() => {
        DecisionRelationship.createBlockedByRelationship(blockingDecision, blockedDecision)
      }).toThrow(DecisionDependencyError)
    })
  })

  describe('Creating Superseding Relationships', () => {
    it('should create a superseding relationship between two decisions', () => {
      const supersedingDecision = emptyDecision.with({
        id: 'superseding-decision'
      })
      const supersededDecision = emptyDecision.with({
        id: 'superseded-decision'
      })

      const relationship = DecisionRelationship.createSupersedesRelationship(
        supersedingDecision,
        supersededDecision
      )

      expect(relationship.organisationId).toBe('org-1')
      expect(relationship.fromDecisionId).toBe('superseding-decision')
      expect(relationship.fromTeamId).toBe('team-1')
      expect(relationship.fromProjectId).toBe('project-1')
      expect(relationship.type).toBe('supersedes')
      expect(relationship.toDecisionId).toBe('superseded-decision')
      expect(relationship.toTeamId).toBe('team-1')
      expect(relationship.toProjectId).toBe('project-1')
    })

    it('should throw error when attempting self-supersession', () => {
      const decision1 = emptyDecision.with({id: "decision-1"})

      expect(() => {
        DecisionRelationship.createSupersedesRelationship(decision1, decision1)
      }).toThrow(DecisionDependencyError)
    })

    it('should throw error when decisions are from different organisations', () => {
      const supersedingDecision = emptyDecision.with({
        id: 'superseding-decision',
        organisationId: 'org-1'
      })
      const supersededDecision = emptyDecision.with({
        id: 'superseded-decision',
        organisationId: 'org-2'
      })

      expect(() => {
        DecisionRelationship.createSupersedesRelationship(supersedingDecision, supersededDecision)
      }).toThrow(DecisionDependencyError)
    })
  })

  describe('Relationship ID Generation', () => {
    it('should generate consistent IDs for relationships', () => {
      const decision1 = emptyDecision.with({
        id: 'decision-1'
      })
      const decision1_1 = emptyDecision.with({
        id: 'decision-1.1'
      })
      const decision2 = emptyDecision.with({
        id: 'decision-2'
      })
      const superceededRelationship = DecisionRelationship.createSupersedesRelationship(decision1_1, decision1);
      const blockedRelationship = DecisionRelationship.createBlockedByRelationship(decision2, decision1_1);
      
      expect(superceededRelationship.id).toBe('decision-1.1_decision-1')
      expect(blockedRelationship.id).toBe('decision-2_decision-1.1')
    })
  })
}) 