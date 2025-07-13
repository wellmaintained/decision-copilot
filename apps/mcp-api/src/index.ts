#!/usr/bin/env node

/**
 * Basic MCP API placeholder
 * Demonstrates Turborepo structure and domain package usage
 */

import 'reflect-metadata';
import { Decision } from '@decision-copilot/domain';

// Simple function demonstrating domain usage
export function createSampleDecision() {
  try {
    const decision = Decision.create({
      id: 'sample-001',
      organisationId: 'org-123',
      title: 'Sample Decision from MCP API',
      description: 'This demonstrates using domain objects in the MCP API',
      cost: 'low',
      reversibility: 'hat',
      stakeholders: [],
      driverStakeholderId: 'driver-001',
      teamIds: [],
      projectIds: [],
      createdAt: new Date()
    });
    
    return {
      success: true,
      decision: {
        id: decision.id,
        title: decision.title,
        status: decision.status
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

console.log('Hello World from MCP API');

// Demonstrate domain usage
const result = createSampleDecision();
console.log('Sample decision result:', result);

// Check if this module is being run directly
if (require.main === module) {
  console.log('MCP API server started successfully');
}