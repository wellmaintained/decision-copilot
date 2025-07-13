import { describe, it, expect } from 'vitest';
import { createSampleDecision } from '../index.js';
import { Decision } from '@decision-copilot/domain';

describe('MCP API', () => {
  it('should be a basic hello world app', () => {
    expect('Hello World').toBe('Hello World');
  });

  it('should be a CommonJS module', () => {
    expect(typeof require).toBe('function');
  });

  it('should be able to create domain objects', () => {
    const result = createSampleDecision();
    
    expect(result.success).toBe(true);
    if (result.success && result.decision) {
      expect(result.decision.id).toBe('sample-001');
      expect(result.decision.title).toBe('Sample Decision from MCP API');
      expect(result.decision.status).toBe('in_progress');
    }
  });

  it('should work with domain Decision class directly', () => {
    const decision = Decision.create({
      id: 'test-001',
      organisationId: 'org-test',
      title: 'Test Decision',
      description: 'Testing domain usage in MCP API',
      cost: 'medium',
      reversibility: 'haircut',
      stakeholders: [],
      driverStakeholderId: 'test-driver',
      teamIds: ['team-1'],
      projectIds: ['project-1'],
      createdAt: new Date()
    });

    expect(decision.id).toBe('test-001');
    expect(decision.title).toBe('Test Decision');
    expect(decision.status).toBe('in_progress');
    expect(decision.organisationId).toBe('org-test');
  });
});