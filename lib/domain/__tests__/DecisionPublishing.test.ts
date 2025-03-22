import { describe, it, expect } from 'vitest'
import { Decision, DecisionProps } from '@/lib/domain/Decision'
import { DecisionStateError } from '@/lib/domain/DecisionError'

describe('Decision Publishing', () => {
  const defaultProps: DecisionProps = {
    id: 'test-id',
    title: 'Test Decision',
    description: 'Test Description',
    cost: 'low',
    createdAt: new Date(),
    criteria: ['test-criteria'],
    options: ['option-a', 'option-b'],
    reversibility: 'hat',
    stakeholders: [
      { stakeholder_id: 'decider-1', role: 'decider' }
    ],
    driverStakeholderId: 'decider-1',
    organisationId: 'org-1',
    teamIds: ['team-1'],
    projectIds: ['project-1'],
    supportingMaterials: [],
    relationships: {}
  }

  describe('publish', () => {
    it('should successfully publish a valid decision', () => {
      const decision = Decision.create({
        ...defaultProps,
        decision: 'option-a',
        decisionMethod: 'consent'
      })

      const publishedDecision = decision.publish()
      
      expect(publishedDecision.status).toBe('published')
      expect(publishedDecision.publishDate).toBeDefined()
      expect(publishedDecision.currentStep.key).toBe('publish')
    })

    it('should set publishDate to current timestamp when publishing', () => {
      const now = new Date()
      const decision = Decision.create({
        ...defaultProps,
        decision: 'option-a',
        decisionMethod: 'consent'
      })

      const publishedDecision = decision.publish()
      
      expect(publishedDecision.publishDate).toBeInstanceOf(Date)
      expect(publishedDecision.publishDate!.getTime()).toBeGreaterThanOrEqual(now.getTime())
      expect(publishedDecision.publishDate!.getTime()).toBeLessThanOrEqual(new Date().getTime())
    })

    it('should throw error when publishing a decision without a chosen option', () => {
      const decision = Decision.create({
        ...defaultProps,
        decisionMethod: 'consent'
      })

      expect(() => decision.publish()).toThrow(DecisionStateError)
    })

    it('should throw error when publishing an already published decision', () => {
      const decision = Decision.create({
        ...defaultProps,
        decision: 'option-a',
        decisionMethod: 'consent',
        publishDate: new Date()
      })

      expect(() => decision.publish()).toThrow(DecisionStateError)
    })

    it('should throw error when publishing a blocked decision', () => {
      const blockingDecision = Decision.create({
        ...defaultProps,
        id: 'blocking-decision',
        title: 'Blocking Decision'
      })

      const decision = Decision.create({
        ...defaultProps,
        decision: 'option-a',
        decisionMethod: 'consent'
      }).setRelationship('blocked_by', blockingDecision)

      expect(() => decision.publish()).toThrow(DecisionStateError)
    })

    it('should throw error when publishing a superseded decision', () => {
      const supersedingDecision = Decision.create({
        ...defaultProps,
        id: 'superseding-decision',
        title: 'Superseding Decision'
      })

      const decision = Decision.create({
        ...defaultProps,
        decision: 'option-a',
        decisionMethod: 'consent'
      }).setRelationship('superseded_by', supersedingDecision)

      expect(() => decision.publish()).toThrow(DecisionStateError)
    })
  })
}) 