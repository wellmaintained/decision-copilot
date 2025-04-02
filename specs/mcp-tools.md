# MCP Tools

## Introduction

This document specifies the tools that will be exposed through the Model Context Protocol (MCP) in Decision Copilot. Tools allow AI agents to perform actions and interact with the decision-making process beyond simply retrieving data.

## Tool Types

### Decision Tools

#### 1. List Decisions

**Tool Name**: `list-decisions`

**Description**: Lists decisions within an organization, with optional filtering.

**Parameters**:
- `organisationId`: The ID of the organization (required)
- `status`: Filter by decision status (optional)
- `teamId`: Filter by team ID (optional)
- `projectId`: Filter by project ID (optional)

**Response Format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON string containing decisions array"
    }
  ]
}
```

**Example Implementation**:
```typescript
server.tool(
  "list-decisions",
  {
    organisationId: z.string(),
    status: z.enum(["in_progress", "blocked", "published", "superseded"]).optional(),
    teamId: z.string().optional(),
    projectId: z.string().optional()
  },
  async ({ organisationId, status, teamId, projectId }) => {
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
    
    // Apply status filter if provided
    if (status) {
      decisions = decisions.filter(d => d.status === status);
    }
    
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
```

#### 2. Get Decision Details

**Tool Name**: `get-decision`

**Description**: Gets detailed information about a specific decision.

**Parameters**:
- `organisationId`: The ID of the organization (required)
- `decisionId`: The ID of the decision (required)

**Response Format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON string containing decision details"
    }
  ]
}
```

### Stakeholder Tools

#### 1. List Decision Stakeholders

**Tool Name**: `list-decision-stakeholders`

**Description**: Lists stakeholders involved in a specific decision with their roles.

**Parameters**:
- `organisationId`: The ID of the organization (required)
- `decisionId`: The ID of the decision (required)

**Response Format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "JSON string containing stakeholders array"
    }
  ]
}
```

### Decision Analysis Tools

#### 1. Summarize Decision

**Tool Name**: `summarize-decision`

**Description**: Generates a textual summary of a decision and its current state.

**Parameters**:
- `organisationId`: The ID of the organization (required)
- `decisionId`: The ID of the decision (required)

**Response Format**:
```json
{
  "content": [
    {
      "type": "text",
      "text": "A human-readable summary of the decision"
    }
  ]
}
```

**Example Implementation**:
```typescript
server.tool(
  "summarize-decision",
  {
    organisationId: z.string(),
    decisionId: z.string()
  },
  async ({ organisationId, decisionId }) => {
    const scope = { organisationId };
    const decisionsRepo = repositories.decisionsRepository;
    const stakeholdersRepo = repositories.stakeholdersRepository;
    
    const decision = await decisionsRepo.getById(decisionId, scope);
    if (!decision) {
      return {
        content: [{ type: "text", text: "Decision not found" }],
        isError: true
      };
    }
    
    // Get the driver stakeholder name
    const driverStakeholder = await stakeholdersRepo.getById(
      decision.driverStakeholderId,
      scope
    );
    
    const driverName = driverStakeholder ? driverStakeholder.name : "Unknown";
    
    // Generate a summary
    const summary = `
      Decision: ${decision.title}
      
      Status: ${decision.status}
      Current workflow step: ${decision.currentStep.label}
      Driver: ${driverName}
      
      Description:
      ${decision.description}
      
      ${
        decision.decision 
          ? `Decision outcome: ${decision.decision}` 
          : "This decision is still in progress."
      }
      
      Cost impact: ${decision.cost}
      Reversibility: ${decision.reversibility}
      
      This decision involves ${decision.stakeholders.length} stakeholders and 
      is linked to ${decision.teamIds.length} teams and ${decision.projectIds.length} projects.
    `;
    
    return {
      content: [{ type: "text", text: summary.trim() }]
    };
  }
);
```

## Tool Implementation

Tools will be implemented using the MCP SDK's tool functionality. Each tool will be backed by calls to the appropriate repository methods.

All tools will include proper error handling and return appropriate error responses when operations cannot be completed.

## Security Considerations

All tool calls will be authenticated and authorized according to the organization-based access control system in Decision Copilot. Tools will only operate on data that the requester has permission to access. 