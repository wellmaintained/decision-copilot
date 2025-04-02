# MCP Authentication

## Introduction

This document outlines the authentication and authorization mechanism for the Model Context Protocol (MCP) integration in Decision Copilot. Proper security controls are essential to ensure that AI agents can only access data they are authorized to view.

## Authentication Flow

### API Key Authentication

The primary authentication method for MCP will be via API keys. API keys will be associated with specific organizations and will have defined permission scopes.

1. API keys will be generated through the Decision Copilot administration interface
2. Each API key will be linked to a specific organization
3. API keys will have configurable permission scopes
4. All MCP requests must include a valid API key in the request header

### Bearer Token Format

MCP requests will use the standard HTTP Authorization header with a Bearer token:

```
Authorization: Bearer <api-key>
```

## Organization-Based Access Control

All resources and tools in the MCP system will enforce organization-based access control:

1. Each resource and tool will require an `organisationId` parameter
2. The system will verify that the API key has access to the specified organization
3. If the API key does not have the required permissions, a 403 Forbidden response will be returned

## Permission Scopes

API keys will have configurable permission scopes to control what actions an AI agent can perform:

| Scope | Description |
|-------|-------------|
| `decisions:read` | Can read decision data |
| `decisions:write` | Can modify decision data |
| `stakeholders:read` | Can read stakeholder data |
| `stakeholders:write` | Can modify stakeholder data |

## Implementation

The authentication and authorization system will be implemented as middleware in the MCP server setup:

```typescript
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";

// API key validation middleware
const validateApiKey = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).send('Unauthorized: Missing or invalid authorization header');
  }
  
  const apiKey = authHeader.slice(7); // Remove 'Bearer ' prefix
  
  // Validate API key against storage
  const keyData = await apiKeyRepository.getByKey(apiKey);
  if (!keyData) {
    return res.status(401).send('Unauthorized: Invalid API key');
  }
  
  // Attach key data to request for later use
  req.apiKeyData = {
    organisationId: keyData.organisationId,
    scopes: keyData.scopes,
  };
  
  next();
};

// Setup MCP with authentication
app.get("/mcp/sse", validateApiKey, async (req, res) => {
  const transport = new SSEServerTransport('/mcp/messages', res);
  transports[transport.sessionId] = transport;
  
  // Attach auth context to transport for later use in resource/tool handlers
  transport.context = {
    auth: req.apiKeyData
  };
  
  res.on("close", () => {
    delete transports[transport.sessionId];
  });
  
  await server.connect(transport);
});

app.post("/mcp/messages", validateApiKey, async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = transports[sessionId];
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send('No transport found for sessionId');
  }
});
```

## Context-Aware Resource and Tool Handlers

Resource and tool handlers will use the authentication context to enforce organization-based access control:

```typescript
server.resource(
  "decisions",
  new ResourceTemplate("decisions://{organisationId}/list", { list: undefined }),
  async (uri, { organisationId }, context) => {
    // Check if API key has access to the requested organization
    if (context.auth.organisationId !== organisationId) {
      throw new Error("Unauthorized access to organization");
    }
    
    // Check if API key has required scope
    if (!context.auth.scopes.includes('decisions:read')) {
      throw new Error("Insufficient permissions");
    }
    
    // Proceed with the request...
    const scope = { organisationId };
    const decisionsRepo = repositories.decisionsRepository;
    const decisions = await decisionsRepo.getAll(scope);
    
    return {
      contents: [{
        uri: uri.href,
        decisions: decisions.map(d => ({
          id: d.id,
          title: d.title,
          // ... other fields
        }))
      }]
    };
  }
);
```

## API Key Management

The application will provide a management interface for administrators to:

1. Generate new API keys for specific organizations
2. Configure permission scopes for each key
3. View usage statistics for each key
4. Revoke keys when necessary

## Security Considerations

1. API keys will be stored using secure hashing (bcrypt)
2. All MCP communications will be over HTTPS
3. API keys will have configurable expiration dates
4. The system will implement rate limiting to prevent abuse
5. Access attempts with invalid or revoked keys will be logged
6. Regular security audits will be conducted to identify potential vulnerabilities 