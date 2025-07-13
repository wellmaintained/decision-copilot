# Decision Copilot MCP API

This is a Model Context Protocol (MCP) server that provides standardized access to Decision Copilot's decision-making workflow functionality.

## What is MCP?

Model Context Protocol (MCP) is a standard for connecting Large Language Models (LLMs) to external tools and data sources. This server exposes Decision Copilot's domain logic as MCP tools that can be used by any MCP-compatible LLM client.

## Available Tools

- `get_organisation_decisions` - Retrieve all decisions for a specific organisation
- `create_decision` - Create a new decision in an organisation  
- `get_decision_details` - Get detailed information about a specific decision

## Usage

### Development
```bash
pnpm run dev
```

### Build
```bash
pnpm run build
```

### Production
```bash
pnpm run start
```

## Architecture

The MCP API uses:
- `@decision-copilot/domain` for business logic and validation
- `@decision-copilot/infrastructure` for Firebase Admin SDK data access
- `@modelcontextprotocol/sdk` for MCP protocol implementation

## Firebase Functions Deployment

This can be deployed as a Firebase Function to provide serverless MCP access:

```bash
# Deploy to Firebase Functions
firebase deploy --only functions
```

The function will be accessible via HTTP and can be configured as an MCP server endpoint.