# MCP Implementation Plan

## Introduction

This document outlines the implementation plan for integrating the Model Context Protocol (MCP) into Decision Copilot. It includes the necessary steps, dependencies, and timeline for enabling AI agents to interact with decisions through MCP.

## Implementation Steps

### Phase 1: Infrastructure Setup

1. **Add SDK Dependencies**
   - Add `@modelcontextprotocol/sdk` to the project
   - Update package.json and install dependencies

   ```bash
   pnpm add @modelcontextprotocol/sdk
   ```

2. **Create Directory Structure**
   - Create the MCP module directories:
   
   ```
   lib/
     infrastructure/
       mcp/
         auth.ts             # Authentication utilities
         server.ts           # Main MCP server setup
         resources/          # Resource handlers
           decisions.ts      # Decision-related resources
           stakeholders.ts   # Stakeholder-related resources
         tools/              # Tool handlers
           decisions.ts      # Decision-related tools
           stakeholders.ts   # Stakeholder-related tools
   app/
     api/
       mcp/
         sse/
           route.ts          # SSE endpoint
         messages/
           route.ts          # Message handling endpoint
   ```

3. **Create API Key Storage**
   - Implement Firestore collection for API keys
   - Create API key data model
   - Implement repository for API key management

### Phase 2: Core Implementation

1. **Implement Authentication**
   - Develop the API key validation middleware
   - Implement organization-based access control
   - Create permission scope validation logic

2. **Implement SSE Endpoint**
   - Set up the Next.js SSE route
   - Implement MCP server initialization
   - Set up transport management

3. **Implement MCP Resources**
   - Develop decision list resource
   - Develop decision detail resource
   - Develop decision workflow resource
   - Develop stakeholder resources

4. **Implement MCP Tools**
   - Develop decision listing tool
   - Develop decision detail tool
   - Develop stakeholder tools
   - Develop decision analysis tools

### Phase 3: Management Interface

1. **Create API Key Management UI**
   - Develop interface for generating API keys
   - Implement scope configuration UI
   - Create key revocation functionality
   - Add usage statistics

2. **Documentation**
   - Create developer documentation for API consumers
   - Document authentication process
   - Document available resources and tools
   - Provide usage examples

### Phase 4: Testing and Deployment

1. **Unit Testing**
   - Write tests for authentication
   - Test resource handlers
   - Test tool handlers

2. **Integration Testing**
   - Test the complete flow with a sample client
   - Verify security controls
   - Test edge cases and error handling

3. **Performance Testing**
   - Load test the SSE endpoint
   - Optimize any bottlenecks

4. **Deployment**
   - Deploy to staging environment
   - Verify functionality
   - Deploy to production

## Code Samples

### API Key Repository

```typescript
// lib/domain/apiKeyRepository.ts
export interface ApiKeyData {
  id: string;
  key: string;  // Hashed key
  organisationId: string;
  name: string;
  scopes: string[];
  createdAt: Date;
  expiresAt?: Date;
  lastUsedAt?: Date;
}

export interface ApiKeyScope {
  organisationId: string;
}

export interface ApiKeyRepository {
  create(data: Omit<ApiKeyData, "id" | "createdAt">): Promise<ApiKeyData>;
  getById(id: string, scope: ApiKeyScope): Promise<ApiKeyData | null>;
  getByKey(key: string): Promise<ApiKeyData | null>;
  update(id: string, data: Partial<ApiKeyData>, scope: ApiKeyScope): Promise<void>;
  delete(id: string, scope: ApiKeyScope): Promise<void>;
  listByOrganisation(scope: ApiKeyScope): Promise<ApiKeyData[]>;
}
```

### Authentication Middleware

```typescript
// lib/infrastructure/mcp/auth.ts
import { createHash } from 'crypto';
import { ApiKeyRepository } from '@/lib/domain/apiKeyRepository';

interface AuthResult {
  success: boolean;
  status?: number;
  error?: string;
  data?: {
    organisationId: string;
    scopes: string[];
  };
}

export async function validateApiKey(request: Request): Promise<AuthResult> {
  const authHeader = request.headers.get('authorization');
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return {
      success: false,
      status: 401,
      error: 'Unauthorized: Missing or invalid authorization header'
    };
  }
  
  const apiKey = authHeader.slice(7); // Remove 'Bearer ' prefix
  
  // Get the API key repository
  const apiKeyRepo = getApiKeyRepository();
  
  // Validate the key
  const keyData = await apiKeyRepo.getByKey(apiKey);
  if (!keyData) {
    return {
      success: false,
      status: 401,
      error: 'Unauthorized: Invalid API key'
    };
  }
  
  // Check if key is expired
  if (keyData.expiresAt && keyData.expiresAt < new Date()) {
    return {
      success: false,
      status: 401,
      error: 'Unauthorized: Expired API key'
    };
  }
  
  // Update last used timestamp
  await apiKeyRepo.update(
    keyData.id, 
    { lastUsedAt: new Date() }, 
    { organisationId: keyData.organisationId }
  );
  
  return {
    success: true,
    data: {
      organisationId: keyData.organisationId,
      scopes: keyData.scopes,
    }
  };
}

// Utility to generate new API keys
export function generateApiKey(): string {
  const bytes = crypto.randomBytes(32);
  return bytes.toString('base64').replace(/[^a-zA-Z0-9]/g, '');
}

// Utility to hash API keys for storage
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}
```

## Integration with Existing Code

The MCP implementation will integrate with existing code in the following ways:

1. It will use the existing repository interfaces to access data
2. It will follow the domain model patterns established in the application
3. It will leverage the organization-scoped data access pattern
4. It will use the existing authentication infrastructure where possible
5. It will respect the immutability and validation patterns of domain objects

## Timeline

| Phase | Task | Est. Duration |
|-------|------|---------------|
| 1 | Infrastructure Setup | 1 week |
| 2 | Core Implementation | 2 weeks |
| 3 | Management Interface | 1 week |
| 4 | Testing and Deployment | 1 week |

## Technical Risks and Mitigations

| Risk | Mitigation |
|------|------------|
| Server scalability with many SSE connections | Implement connection limits and timeouts |
| Security vulnerabilities in API key handling | Follow security best practices and conduct security review |
| Performance impact on existing application | Isolate MCP handling to minimize impact on core functionality |
| Data synchronization in multi-instance deployment | Use a distributed cache for transport session state |

## Success Criteria

The MCP integration will be considered successful when:

1. AI agents can authenticate and access decision data through the MCP endpoint
2. Resources and tools correctly expose decision data and functionality
3. Security controls effectively limit access to authorized organizations
4. The API performs well under expected load conditions
5. Administrators can easily manage API keys and permissions 