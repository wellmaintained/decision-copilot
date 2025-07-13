# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Environment Setup

**IMPORTANT: Use Latest LTS Versions**

This project requires the latest LTS versions for optimal performance and security:

- **Node.js**: v22.x (Current LTS)
- **pnpm**: v10.13.1 (Latest version)

**Install/Update pnpm:**
```bash
# Update to latest version
pnpm self-update

# Or install globally
npm install -g pnpm@latest
```

The project will enforce these versions through:
- `engines` field in package.json
- `engine-strict=true` in .npmrc

**IMPORTANT: Configure Firebase Environment Variables**

1. Copy the environment template:
   ```bash
   cp .env.example .env.local
   ```

2. Fill in your Firebase project configuration in `.env.local`:
   ```bash
   NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
   NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project_id.firebasestorage.app
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
   NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
   NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
   ```

3. For webapp development, also copy environment to apps/webapp:
   ```bash
   cp .env.local apps/webapp/.env.local
   ```

**Get Firebase Configuration:**
- Visit [Firebase Console](https://console.firebase.google.com/)
- Select your project → Project Settings → General tab
- Scroll to "Your apps" section and copy the config values

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

**Development Logs:**
```bash
# View latest development logs (timestamped, hourly rotation)
ls -la logs/turbo-dev.*.log | tail -1        # Find latest log file
tail -f logs/turbo-dev.$(date '+%Y-%m-%d-%H').log  # Follow current hour's log
cat logs/turbo-dev.$(date '+%Y-%m-%d-%H').log       # Read current hour's log

# Examples:
tail -100 logs/turbo-dev.2025-07-13-14.log   # Last 100 lines from 2 PM session
grep -i error logs/turbo-dev.*.log           # Search for errors across all logs
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

## Development Best Practices

### Using sed for Code Transformations

**CRITICAL: Always test sed patterns thoroughly before applying to multiple files**

Common pitfalls and solutions:

1. **Quote Type Handling**: When replacing import paths, account for both single and double quotes:
   ```bash
   # ❌ WRONG: Only handles double quotes
   sed 's|@old-package/[^"]*|@new-package|g'
   
   # ✅ CORRECT: Handles both quote types
   sed "s#@old-package/[^'\"]*#@new-package#g"
   ```

2. **Delimiter Choice**: Use `#` delimiter when pattern contains `/` or `|`:
   ```bash
   # ❌ WRONG: Conflicts with path separators
   sed 's|@package/[^"]*|@new|g'
   
   # ✅ CORRECT: Use # to avoid conflicts
   sed 's#@package/[^"]*#@new#g'
   ```

3. **Always Test First**: Test patterns on sample text before applying to files:
   ```bash
   # Test your pattern first
   echo 'import { Test } from "@old-package/module";' | sed 's#pattern#replacement#g'
   
   # Then apply to files
   find . -name "*.ts" -exec sed -i 's#pattern#replacement#g' {} \;
   ```

4. **Character Class Escaping**: When matching until quotes, escape properly:
   ```bash
   # ✅ CORRECT: Escape quotes in character class
   sed "s#@package/[^'\"]*#@new#g"
   ```

## Testing Notes

- **Vitest Best Practices**:
  - Use pnpm rather than npx when running vitest