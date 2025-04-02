# MCP API Endpoint

## Introduction

This document details the implementation of the MCP (Model Context Protocol) API endpoint in Decision Copilot. The endpoint will use Server-Sent Events (SSE) to enable bidirectional communication between AI agents and the application.

## Endpoint Architecture

### API Routes

The MCP endpoint will be exposed through Next.js API routes:

```
/mcp/sse      - SSE connection endpoint
/mcp/messages - Message endpoint for sending data to the server
```

### Server-Sent Events (SSE)

Server-Sent Events allow the server to push data to clients over a single HTTP connection. This is well-suited for MCP's bidirectional communication requirements.

Key features of SSE:
- Long-lived connection for server-to-client messaging
- Automatic reconnection
- Event IDs and reconnection points
- Text-based protocol

## Implementation Details

### API Routes Structure

```
app/
  api/
    mcp/
      sse/
        route.ts      - SSE endpoint
      messages/
        route.ts      - Message handling endpoint
```

### SSE Endpoint Implementation

```typescript
// app/api/mcp/sse/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { validateApiKey } from '@/lib/infrastructure/mcp/auth';
import { getRepositories } from '@/lib/infrastructure/repositories';
import { setupMcpServer } from '@/lib/infrastructure/mcp/server';

// In-memory store of active transports
// In a production environment with multiple instances, this would need to be
// stored in a distributed cache like Redis
const transports: {[sessionId: string]: SSEServerTransport} = {};

export async function GET(request: Request) {
  // Authenticate the request
  const authResult = await validateApiKey(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Set up the MCP server
  const repositories = getRepositories();
  const server = setupMcpServer(repositories);

  // Create the response with appropriate headers for SSE
  const response = new Response(new ReadableStream({
    start(controller) {
      // Create a custom response object that the SSE transport can use
      const customResponse = {
        write: (data: string) => {
          controller.enqueue(new TextEncoder().encode(data));
          return true;
        },
        flush: () => {
          // Not needed for ReadableStream
        },
        end: () => {
          controller.close();
        }
      };

      // Create the SSE transport
      const transport = new SSEServerTransport('/api/mcp/messages', customResponse);
      
      // Store the transport for later use
      transports[transport.sessionId] = transport;
      
      // Attach auth context to transport
      transport.context = {
        auth: authResult.data
      };
      
      // Send initial headers and session ID
      customResponse.write(`data: ${JSON.stringify({ sessionId: transport.sessionId })}\n\n`);
      
      // Connect the server to the transport
      server.connect(transport).catch((error) => {
        console.error('Error connecting to transport:', error);
        controller.error(error);
      });
      
      // Clean up when the connection closes
      request.signal.addEventListener('abort', () => {
        if (transports[transport.sessionId]) {
          delete transports[transport.sessionId];
        }
      });
    }
  }), {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
    },
  });

  return response;
}
```

### Message Endpoint Implementation

```typescript
// app/api/mcp/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { validateApiKey } from '@/lib/infrastructure/mcp/auth';

export async function POST(request: NextRequest) {
  // Authenticate the request
  const authResult = await validateApiKey(request);
  if (!authResult.success) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  // Get the session ID from the URL
  const sessionId = request.nextUrl.searchParams.get('sessionId');
  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId parameter' },
      { status: 400 }
    );
  }

  // Get the transport for this session
  const transport = transports[sessionId];
  if (!transport) {
    return NextResponse.json(
      { error: 'Invalid or expired sessionId' },
      { status: 400 }
    );
  }

  try {
    // Get the message body
    const body = await request.json();
    
    // Process the message
    await transport.handlePostMessage(body);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error handling MCP message:', error);
    return NextResponse.json(
      { error: 'Failed to process message' },
      { status: 500 }
    );
  }
}
```

## MCP Server Setup

The MCP server will be configured in a separate module:

```typescript
// lib/infrastructure/mcp/server.ts
import { McpServer, ResourceTemplate } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { Repositories } from '@/lib/infrastructure/repositories';
import { Decision, DecisionWorkflowSteps } from '@/lib/domain/Decision';

export function setupMcpServer(repositories: Repositories): McpServer {
  const server = new McpServer({
    name: "DecisionCopilot",
    version: "1.0.0"
  });

  // Set up resources
  setupResources(server, repositories);
  
  // Set up tools
  setupTools(server, repositories);

  return server;
}

function setupResources(server: McpServer, repositories: Repositories) {
  // Decision list resource
  server.resource(
    "decisions",
    new ResourceTemplate("decisions://{organisationId}/list", { list: undefined }),
    async (uri, { organisationId }, context) => {
      // Check authorization
      if (context.auth.organisationId !== organisationId) {
        throw new Error("Unauthorized access to organization");
      }
      
      // Fetch decisions
      const scope = { organisationId };
      const decisionsRepo = repositories.decisionsRepository;
      const decisions = await decisionsRepo.getAll(scope);
      
      // Format and return
      return {
        contents: [{
          uri: uri.href,
          decisions: decisions.map(d => ({
            id: d.id,
            title: d.title,
            description: d.description,
            status: d.status,
            currentStep: d.currentStep.key,
            createdAt: d.createdAt.toISOString(),
            updatedAt: d.updatedAt?.toISOString()
          }))
        }]
      };
    }
  );

  // Additional resources...
}

function setupTools(server: McpServer, repositories: Repositories) {
  // List decisions tool
  server.tool(
    "list-decisions",
    {
      organisationId: z.string(),
      status: z.enum(["in_progress", "blocked", "published", "superseded"]).optional(),
      teamId: z.string().optional(),
      projectId: z.string().optional()
    },
    async ({ organisationId, status, teamId, projectId }, context) => {
      // Check authorization
      if (context.auth.organisationId !== organisationId) {
        throw new Error("Unauthorized access to organization");
      }
      
      // Fetch and filter decisions
      const scope = { organisationId };
      const decisionsRepo = repositories.decisionsRepository;
      
      let decisions: Decision[];
      
      if (teamId) {
        decisions = await decisionsRepo.getByTeam(teamId, scope);
      } else if (projectId) {
        decisions = await decisionsRepo.getByProject(projectId, scope);
      } else {
        decisions = await decisionsRepo.getAll(scope);
      }
      
      if (status) {
        decisions = decisions.filter(d => d.status === status);
      }
      
      // Format and return
      const formattedDecisions = decisions.map(decision => ({
        id: decision.id,
        title: decision.title,
        description: decision.description,
        status: decision.status,
        currentStep: decision.currentStep.key,
        createdAt: decision.createdAt.toISOString(),
        updatedAt: decision.updatedAt?.toISOString()
      }));
      
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(formattedDecisions, null, 2)
          }
        ]
      };
    }
  );

  // Additional tools...
}
```

## Error Handling

The MCP endpoint will handle errors gracefully:

1. Authentication errors will return appropriate 401/403 status codes
2. Invalid requests will return 400 status codes with descriptive error messages
3. Server errors will return 500 status codes and log details for debugging
4. Client disconnections will be properly detected and resources will be cleaned up

## Security Considerations

1. All requests will be authenticated via API keys
2. Organization-based access control will be enforced
3. Rate limiting will be implemented to prevent abuse
4. All communications will be over HTTPS
5. Error messages will not expose sensitive information

## Performance Considerations

1. Connections will timeout after an appropriate period of inactivity
2. Resource-intensive operations will be optimized
3. In a production environment with multiple instances, transport sessions would be stored in a distributed cache
4. Monitoring will be implemented to track endpoint performance and usage

## Testing

The MCP endpoint will be thoroughly tested:

1. Unit tests for individual components
2. Integration tests for the complete endpoint
3. Load testing to ensure performance under high concurrency
4. Security testing to validate authentication and authorization 