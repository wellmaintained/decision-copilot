#!/usr/bin/env node

/**
 * Decision Copilot MCP (Model Context Protocol) API
 * 
 * This server provides MCP tools for interacting with decision-making workflows.
 * It exposes domain operations through standardized MCP interfaces.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { 
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Initialize Firebase Admin for server-side operations
import '@decision-copilot/infrastructure';

class DecisionCopilotMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'decision-copilot-mcp',
        version: '0.5.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupToolHandlers();
  }

  private setupToolHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => {
      return {
        tools: [
          {
            name: 'get_organisation_decisions',
            description: 'Retrieve all decisions for a specific organisation',
            inputSchema: {
              type: 'object',
              properties: {
                organisationId: {
                  type: 'string',
                  description: 'The ID of the organisation'
                }
              },
              required: ['organisationId']
            }
          },
          {
            name: 'create_decision',
            description: 'Create a new decision in an organisation',
            inputSchema: {
              type: 'object',
              properties: {
                organisationId: {
                  type: 'string',
                  description: 'The ID of the organisation'
                },
                title: {
                  type: 'string',
                  description: 'The decision title'
                },
                description: {
                  type: 'string',
                  description: 'The decision description'
                }
              },
              required: ['organisationId', 'title']
            }
          },
          {
            name: 'get_decision_details',
            description: 'Get detailed information about a specific decision',
            inputSchema: {
              type: 'object',
              properties: {
                organisationId: {
                  type: 'string',
                  description: 'The ID of the organisation'
                },
                decisionId: {
                  type: 'string',
                  description: 'The ID of the decision'
                }
              },
              required: ['organisationId', 'decisionId']
            }
          }
        ]
      };
    });

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params;

      if (!args) {
        throw new Error('Tool arguments are required');
      }

      switch (name) {
        case 'get_organisation_decisions':
          return await this.getOrganisationDecisions(args.organisationId as string);
        
        case 'create_decision':
          return await this.createDecision(
            args.organisationId as string, 
            args.title as string
          );
        
        case 'get_decision_details':
          return await this.getDecisionDetails(
            args.organisationId as string, 
            args.decisionId as string
          );
        
        default:
          throw new Error(`Unknown tool: ${name}`);
      }
    });
  }

  private async getOrganisationDecisions(organisationId: string) {
    try {
      // TODO: Implement using domain services and infrastructure
      return {
        content: [
          {
            type: 'text',
            text: `Decisions for organisation ${organisationId} (placeholder implementation)`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get decisions: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async createDecision(organisationId: string, title: string) {
    try {
      // TODO: Implement using domain services and infrastructure
      return {
        content: [
          {
            type: 'text',
            text: `Created decision "${title}" in organisation ${organisationId} (placeholder implementation)`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to create decision: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async getDecisionDetails(organisationId: string, decisionId: string) {
    try {
      // TODO: Implement using domain services and infrastructure
      return {
        content: [
          {
            type: 'text',
            text: `Decision details for ${decisionId} in organisation ${organisationId} (placeholder implementation)`
          }
        ]
      };
    } catch (error) {
      throw new Error(`Failed to get decision details: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  async run() {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('Decision Copilot MCP server running on stdio');
  }
}

// Start the server
async function main() {
  const server = new DecisionCopilotMCPServer();
  await server.run();
}

if (require.main === module) {
  main().catch((error) => {
    console.error('Server error:', error);
    process.exit(1);
  });
}