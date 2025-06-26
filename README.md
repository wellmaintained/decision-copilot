# Decision Copilot

Decision Copilot guides teams through the process of making decisions together, providing structure and removing toil to enable great decision making.

## Purpose

Decision Copilot helps teams make **great** decisions by ensuring stakeholders:
- Understand what the decision is about
- Are clear how the decision will be made
- Have participated in making the decision (according to their role)
- Can access details of the decision once it has been made

Great decisions are made **quickly** and with **minimal toil**.

## Application Overview

### Core Functionality

**Structured Decision Workflow**
- 5-step guided process: Identify → Method → Options → Choose → Publish
- Single-page workflow with horizontal progress indicator
- Accordion sections for easy reference to previous information

**Stakeholder Management**
- Team hierarchy visualization with expandable tree structure
- Role-based participation (Decider, Consulted, Informed)
- Team-level and individual stakeholder selection
- Smart suggestions for leadership and related teams

**Decision Organization**
- Multi-team and multi-project associations
- Decision relationships (blocking, superseding, enabling)
- Cost and reversibility classifications (hat/haircut/tattoo)
- Supporting materials and documentation

**Collaborative Features**
- Real-time updates via Firebase subscriptions
- Organization-based security boundaries
- Cross-team decision visibility and collaboration

### Technology Stack

- **Framework**: Next.js 15 with React 19 and App Router
- **Database**: Firebase Firestore with real-time subscriptions
- **Authentication**: Firebase Auth
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Architecture**: Domain-driven design with Repository pattern

## Use the Application

https://decision-copilot.wellmaintained.org/

## Development

### Quick Start

```bash
pnpm run dev
```

This starts Firebase emulators with data import and Next.js dev server with Turbopack.

### Documentation

- [Architecture Overview](./docs/ARCHITECTURE.md)
- [Decision Workflow Design](./docs/decision_workflow.md)
- [Stakeholder UI Design](./docs/stakeholder_ui.md)
- [Decision Domain Model](./docs/domain/decision.md)
- [Organisation Domain Model](./docs/domain/organisation.md)
- [Team Hierarchy Implementation](./docs/domain/team_hierarchy.md)

### Development Commands

```bash
# Setup
pnpm install                   # Install dependencies

# Development
pnpm run dev                   # Start dev environment
pnpm run dev:emulators:with-data # Start emulators with data

# Testing
pnpm run test:unit             # Unit tests only
pnpm run test                  # All tests including integration

# Build and Quality
pnpm run pre:push              # Lint, test, and build before push
pnpm run lint                  # Check for lint errors
pnpm run lint:fix              # Auto-fix lint errors
```


