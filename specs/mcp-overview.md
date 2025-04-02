# MCP Integration Overview

## Introduction

This document outlines the integration of the Model Context Protocol (MCP) into the Decision Copilot application. MCP allows AI agents to interact with the application by providing a standardized way to access and manipulate decision data.

## Purpose

The MCP integration enables AI agents to:
- List available decisions
- Get detailed information about specific decisions
- Navigate through decision workflow steps
- Access stakeholder information related to decisions

## Technical Approach

We will implement an MCP server using the TypeScript SDK from [modelcontextprotocol/typescript-sdk](https://github.com/modelcontextprotocol/typescript-sdk). The server will expose resources and tools that AI agents can use to interact with the decision-making process.

## Endpoint

The MCP server will be exposed through a Server-Sent Events (SSE) endpoint at:

```
/mcp/sse
```

This endpoint will handle the bidirectional communication required by the MCP protocol.

## Architecture

The MCP integration will follow these architectural principles:

1. **Domain Separation**: MCP-specific code will be isolated in its own module
2. **Adapter Pattern**: We'll implement adapters that convert between our domain objects and MCP resources
3. **Repository Access**: MCP handlers will access data through existing repository interfaces
4. **Security**: Access control will be enforced for all MCP interactions

## Dependencies

- `@modelcontextprotocol/sdk` - The official TypeScript SDK for MCP
- Express middleware for handling the SSE endpoint
- Our existing domain models and repositories

## Implementation Timeline

1. Add MCP SDK dependencies
2. Implement the MCP server infrastructure
3. Define and implement resources for decisions
4. Define and implement tools for interacting with decisions
5. Add the SSE endpoint to the Next.js API routes
6. Implement authentication and authorization
7. Write tests for the MCP integration

## Related Specifications

- [MCP Resources](./mcp-resources.md) - Details about the resources exposed through MCP
- [MCP Tools](./mcp-tools.md) - Details about the tools exposed through MCP
- [MCP Authentication](./mcp-authentication.md) - How authentication works with MCP
- [MCP API Endpoint](./mcp-api-endpoint.md) - Details about the SSE endpoint implementation 