# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

**Start development environment:**
```bash
pnpm run dev
```
This starts Firebase emulators with data import and Next.js dev server with Turbopack.

**Build and test before push:**
```bash
pnpm run pre:push
```
Runs lint, unit tests, and build - required before pushing.

**Testing:**
```bash
pnpm run test:unit           # Unit tests only (excludes integration tests)
pnpm run test:unit:watch     # Watch mode for unit tests
pnpm run test                # All tests including integration
```

**Linting:**
```bash
pnpm run lint        # Check for lint errors
pnpm run lint:fix    # Auto-fix lint errors
```

**Firebase:**
```bash
pnpm run dev:emulators:with-data    # Start emulators with imported data
pnpm run emulators:export           # Export emulator data
```

## Architecture Overview

This is a Next.js 15 + React 19 application using Firebase for backend services. The codebase follows a layered architecture with domain-driven design principles.

### Key Layers

1. **Presentation** (`app/`): Next.js App Router pages and layouts
2. **Components** (`components/`): Reusable UI components using shadcn/ui + Radix UI
3. **Application** (`hooks/`): Custom React hooks for business logic and data fetching
4. **Domain** (`lib/domain/`): Core business models, validation, and repository interfaces
5. **Infrastructure** (`lib/infrastructure/`): Firestore repository implementations

### Domain Model Pattern

Domain objects use Props interfaces with class-validator decorators:

```typescript
interface DecisionProps {
  id: string
  title: string
  // ... other props
}

class Decision {
  @IsString()
  @MinLength(5)
  readonly title: string
  
  private constructor(props: DecisionProps) { /* ... */ }
  static create(props: DecisionProps): Decision { /* ... */ }
}
```

Key patterns:
- Props interfaces define data structure
- Domain classes contain validation and business logic
- Private constructors with static factory methods
- Immutable properties
- Repository pattern for data access

### Technology Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Firebase Firestore
- **Auth**: Firebase Auth
- **UI**: shadcn/ui components with Radix UI primitives
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with class-validator
- **Testing**: Vitest
- **Package Manager**: pnpm

### Import Conventions

Use absolute imports with `@/` prefix:
```typescript
import { Decision } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'
```

### Firebase Structure

- Development uses Firebase emulators with local data import
- Firestore repositories implement domain repository interfaces
- Authentication handled through Firebase Auth

### Testing Strategy

- Unit tests exclude integration tests (`**/*.integration.test.ts`)
- Integration tests require Firebase emulators
- Domain objects have comprehensive validation tests
- Repository pattern enables easy mocking for tests