/**
 * Decision props interface for testing
 * This mirrors the DecisionProps from @decision-copilot/domain
 */
export interface DecisionProps {
  id: string
  title: string
  description: string
  cost: 'low' | 'medium' | 'high'
  createdAt: Date
  reversibility: 'hat' | 'haircut' | 'tattoo'
  stakeholders: Array<{ stakeholder_id: string; role: string }>
  driverStakeholderId: string
  organisationId: string
  teamIds: string[]
  projectIds: string[]
  supportingMaterials: unknown[]
  relationships: Record<string, unknown>
  decision?: string
  decisionMethod?: string
  publishDate?: Date
}

/**
 * Default decision props for testing
 */
export const defaultDecisionProps: DecisionProps = {
  id: 'test-decision-1',
  title: 'Test Decision',
  description: 'A test decision for unit testing',
  cost: 'low',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  reversibility: 'hat',
  stakeholders: [],
  driverStakeholderId: 'test-driver-1',
  organisationId: 'test-org-1',
  teamIds: ['test-team-1'],
  projectIds: ['test-project-1'],
  supportingMaterials: [],
  relationships: {}
}

/**
 * Decision props with stakeholders for testing
 */
export const decisionWithStakeholdersProps: DecisionProps = {
  ...defaultDecisionProps,
  id: 'test-decision-with-stakeholders',
  stakeholders: [
    { stakeholder_id: 'test-driver-1', role: 'decider' },
    { stakeholder_id: 'test-stakeholder-1', role: 'consulted' },
    { stakeholder_id: 'test-stakeholder-2', role: 'informed' }
  ]
}

/**
 * Published decision props for testing
 */
export const publishedDecisionProps: DecisionProps = {
  ...decisionWithStakeholdersProps,
  id: 'test-published-decision',
  decision: 'Selected option A',
  decisionMethod: 'consent',
  publishDate: new Date('2024-01-15T12:00:00Z')
}

/**
 * Decision props for relationship testing
 */
export const blockingDecisionProps: DecisionProps = {
  ...defaultDecisionProps,
  id: 'test-blocking-decision',
  title: 'Blocking Decision'
}

export const blockedDecisionProps: DecisionProps = {
  ...defaultDecisionProps,
  id: 'test-blocked-decision',
  title: 'Blocked Decision'
}

/**
 * Factory function to create decision props with custom overrides
 */
export function createDecisionProps(overrides: Partial<DecisionProps> = {}): DecisionProps {
  return {
    ...defaultDecisionProps,
    ...overrides,
    // Ensure unique IDs by default
    id: overrides.id || `test-decision-${Math.random().toString(36).substr(2, 9)}`
  }
}

/**
 * Factory function to create multiple decision props for bulk testing
 */
export function createMultipleDecisionProps(count: number, baseProps?: Partial<DecisionProps>): DecisionProps[] {
  return Array.from({ length: count }, (_, index) => 
    createDecisionProps({
      ...baseProps,
      id: `test-decision-${index + 1}`,
      title: `Test Decision ${index + 1}`
    })
  )
}