# MCP Resources

## Introduction

This document specifies the resources that will be exposed through the Model Context Protocol (MCP) in Decision Copilot. Resources represent data that AI agents can request and use to understand the decision-making context.

## Resource Types

### Decision Resources

Decision resources provide information about decision records in the system.

#### 1. Decision List

**Resource Template**: `decisions://{organisationId}/list`

**Description**: Lists all decisions for a specific organization.

**Parameters**:
- `organisationId`: The ID of the organization whose decisions should be listed.

**Optional Query Parameters**:
- `status`: Filter by decision status (in_progress, blocked, published, superseded)
- `teamId`: Filter by team ID
- `projectId`: Filter by project ID

**Response Format**:
```json
{
  "contents": [
    {
      "uri": "decisions://{organisationId}/list",
      "decisions": [
        {
          "id": "string",
          "title": "string",
          "description": "string",
          "status": "in_progress | blocked | published | superseded",
          "currentStep": "identify | stakeholders | method | choose | publish",
          "createdAt": "ISO-8601 date string",
          "updatedAt": "ISO-8601 date string"
        }
      ]
    }
  ]
}
```

#### 2. Decision Detail

**Resource Template**: `decision://{organisationId}/{decisionId}`

**Description**: Gets detailed information about a specific decision.

**Parameters**:
- `organisationId`: The ID of the organization
- `decisionId`: The ID of the decision

**Response Format**:
```json
{
  "contents": [
    {
      "uri": "decision://{organisationId}/{decisionId}",
      "decision": {
        "id": "string",
        "title": "string",
        "description": "string",
        "cost": "low | medium | high",
        "reversibility": "hat | haircut | tattoo",
        "status": "in_progress | blocked | published | superseded",
        "currentStep": "identify | stakeholders | method | choose | publish",
        "driverStakeholderId": "string",
        "createdAt": "ISO-8601 date string",
        "updatedAt": "ISO-8601 date string",
        "decision": "string",
        "decisionMethod": "string",
        "stakeholders": [
          {
            "stakeholder_id": "string",
            "role": "decider | consulted | informed"
          }
        ],
        "publishDate": "ISO-8601 date string",
        "organisationId": "string",
        "teamIds": ["string"],
        "projectIds": ["string"],
        "relationships": {
          "key": {
            "targetDecisionTitle": "string",
            "type": "blocked_by | supersedes | blocks | superseded_by"
          }
        },
        "decisionNotes": "string",
        "supportingMaterials": [
          {
            "id": "string",
            "title": "string",
            "url": "string",
            "type": "string"
          }
        ]
      }
    }
  ]
}
```

#### 3. Decision Workflow Steps

**Resource Template**: `decision://{organisationId}/{decisionId}/workflow`

**Description**: Gets information about the workflow steps for a specific decision.

**Parameters**:
- `organisationId`: The ID of the organization
- `decisionId`: The ID of the decision

**Response Format**:
```json
{
  "contents": [
    {
      "uri": "decision://{organisationId}/{decisionId}/workflow",
      "workflow": {
        "steps": [
          {
            "key": "identify | stakeholders | method | choose | publish",
            "label": "string",
            "role": "Driver | Decider"
          }
        ],
        "currentStep": "identify | stakeholders | method | choose | publish",
        "completedSteps": ["identify | stakeholders | method | choose | publish"]
      }
    }
  ]
}
```

### Stakeholder Resources

#### 1. Decision Stakeholders

**Resource Template**: `decision://{organisationId}/{decisionId}/stakeholders`

**Description**: Lists all stakeholders involved in a specific decision.

**Parameters**:
- `organisationId`: The ID of the organization
- `decisionId`: The ID of the decision

**Response Format**:
```json
{
  "contents": [
    {
      "uri": "decision://{organisationId}/{decisionId}/stakeholders",
      "stakeholders": [
        {
          "id": "string",
          "name": "string",
          "role": "decider | consulted | informed",
          "isDriver": true
        }
      ]
    }
  ]
}
```

## Resource Implementation

Resources will be implemented using the MCP SDK's resource functionality. Each resource will be backed by calls to the appropriate repository methods.

Example implementation:

```typescript
server.resource(
  "decisions",
  new ResourceTemplate("decisions://{organisationId}/list", { list: undefined }),
  async (uri, { organisationId }) => {
    const scope = { organisationId };
    const decisionsRepo = repositories.decisionsRepository;
    const decisions = await decisionsRepo.getAll(scope);
    
    return {
      contents: [{
        uri: uri.href,
        decisions: decisions.map(decision => ({
          id: decision.id,
          title: decision.title,
          description: decision.description,
          status: decision.status,
          currentStep: decision.currentStep.key,
          createdAt: decision.createdAt.toISOString(),
          updatedAt: decision.updatedAt?.toISOString()
        }))
      }]
    };
  }
);
```

## Security Considerations

All resource requests will be authenticated and authorized according to the organization-based access control system in Decision Copilot. Resources will only return data that the requester has permission to access. 