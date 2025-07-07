# Project Layout - Turborepo Monorepo

This document explains how the Turborepo monorepo layout works for the Decision Copilot project.

## 📁 Directory Structure Overview

```
decision-copilot-turborepo/
├── apps/                     # Applications (deployable packages)
│   ├── webapp/              # Next.js web application
│   └── mcp-api/             # Model Context Protocol API (Firebase functions)
├── packages/                # Shared libraries/utilities
│   ├── domain/              # Framework-agnostic domain models and business logic
│   ├── infrastructure/      # Firebase repository implementations (client & admin SDKs)
│   ├── ui/                  # Reusable React components and design system
│   ├── config-eslint/       # Shared ESLint configuration
│   └── config-typescript/   # Shared TypeScript configuration
├── turbo.json              # Turborepo configuration
├── package.json            # Root workspace configuration
└── pnpm-workspace.yaml     # PNPM workspace definition
```

## 🏗️ Core Turborepo Concepts

### Workspace Structure

The project follows the standard Turborepo pattern with two main directories:

- **`apps/`**: Deployable applications that end users interact with
- **`packages/`**: Shared libraries and utilities consumed by apps

This separation enables:
- **Code reuse** across applications
- **Independent deployment** of different apps
- **Shared configuration** and tooling

### Package Types & Responsibilities

#### 🚀 **Applications (`apps/`)**

##### `apps/webapp`
- **Purpose**: Main web application interface
- **Technology**: Next.js 15 with React 19
- **Description**: User-facing web application for decision management
- **Dependencies**: All shared packages (`@decision-copilot/*`)

##### `apps/mcp-api`
- **Purpose**: Model Context Protocol API server
- **Technology**: Firebase Functions with TypeScript
- **Description**: Backend API for MCP integrations
- **Dependencies**: Domain and Infrastructure packages

#### 📦 **Shared Packages (`packages/`)**

##### `packages/domain`
- **Package Name**: `@decision-copilot/domain`
- **Purpose**: Framework-agnostic domain models and business logic
- **Technology**: Pure TypeScript with class-validator
- **Contents**: Decision, Organisation, Team, Stakeholder models
- **Dependencies**: Zero external dependencies (business logic only)
- **Consumers**: Both webapp and mcp-api

##### `packages/infrastructure`
- **Package Name**: `@decision-copilot/infrastructure`
- **Purpose**: Data access implementations supporting multiple Firebase SDKs
- **Technology**: Firebase client SDK + Firebase admin SDK
- **Contents**: Firestore repositories, Firebase integrations
- **Structure**:
  ```
  src/
  ├── client/           # Firebase client SDK repositories
  ├── admin/            # Firebase admin SDK repositories
  ├── firebase-client.ts
  └── firebase-admin.ts
  ```
- **Dependencies**: Domain package, Firebase SDKs

##### `packages/ui`
- **Package Name**: `@decision-copilot/ui`
- **Purpose**: Shared React components and design system
- **Technology**: React 19 with shadcn/ui + Radix UI
- **Contents**: Complete shadcn/ui component library, business components
- **Dependencies**: React, Radix UI primitives, Tailwind CSS
- **Consumers**: webapp (and future web applications)

##### `packages/config-eslint`
- **Package Name**: `@decision-copilot/config-eslint`
- **Purpose**: Shared ESLint configuration across all packages
- **Technology**: ESLint flat config format
- **Contents**: next.js, node.js, react-internal.js configurations
- **Consumers**: All packages and apps

##### `packages/config-typescript`
- **Package Name**: `@decision-copilot/config-typescript`
- **Purpose**: Shared TypeScript configuration templates
- **Contents**: base.json, nextjs.json, node.json, react-library.json
- **Consumers**: All packages and apps

## 🔄 Dependency Flow Architecture

The packages follow a clean dependency hierarchy:

```
┌─────────────────────────────────────────┐
│                Apps                     │
│  ┌─────────────┐    ┌─────────────────┐ │
│  │   webapp    │    │    mcp-api      │ │
│  │ (Next.js)   │    │ (Firebase Fns)  │ │
│  └─────────────┘    └─────────────────┘ │
└─────────────────────────────────────────┘
              │                │
              ▼                ▼
┌─────────────────────────────────────────┐
│            Shared Packages              │
│  ┌─────────┐  ┌─────────────┐  ┌─────┐  │
│  │   UI    │  │Infrastructure│  │Config│ │
│  └─────────┘  └─────────────┘  └─────┘  │
│                     │                   │
│                     ▼                   │
│               ┌─────────┐               │
│               │ Domain  │               │
│               └─────────┘               │
└─────────────────────────────────────────┘
```

### Package Dependencies

- **webapp**: depends on `domain`, `infrastructure`, `ui`, `config-*`
- **mcp-api**: depends on `domain`, `infrastructure`, `config-*`
- **infrastructure**: depends on `domain`
- **ui**: depends on `config-*` (no domain coupling)
- **domain**: zero dependencies (pure business logic)

## ⚙️ Turborepo Configuration

### Task Configuration (`turbo.json`)

The Turborepo configuration defines how tasks execute across the monorepo:

#### Build Tasks
```json
"build": {
  "dependsOn": ["^build"],
  "outputs": ["dist/**", ".next/**", "lib/**"],
  "inputs": ["src/**", "*.ts", "*.tsx", "*.js", "*.jsx", "tsconfig.json", "package.json"]
}
```

- **`"dependsOn": ["^build"]`**: Wait for dependencies to build first
- **`"outputs"`**: Cache these directories for faster rebuilds
- **`"inputs"`**: Invalidate cache when these files change

#### Test Tasks
```json
"test:unit": {
  "dependsOn": [],
  "outputs": ["coverage/**"],
  "inputs": ["src/**", "*.test.ts", "*.test.tsx", "vitest.config.ts", "tsconfig.json"]
}
```

- **`"dependsOn": []`**: Run independently (fast feedback)
- Critical advantage: Unit tests don't wait for builds

#### Development Tasks
```json
"dev": {
  "cache": false,
  "persistent": true
}
```

- **`"cache": false`**: Never cache development servers
- **`"persistent": true`**: Keep running until manually stopped

### Smart Caching Strategy

Turborepo automatically caches task outputs based on input hashes:

1. **First build**: Executes all tasks, caches outputs
2. **No changes**: Uses cached outputs (instant)
3. **Selective changes**: Only rebuilds affected packages

### Task Execution Order

When running `pnpm run build`, Turborepo executes tasks in this order:

1. **Config packages** (instant: `exit 0` no-op scripts)
2. **Domain & UI packages** (parallel: no interdependency)
3. **Infrastructure package** (depends on domain)
4. **Apps** (webapp & mcp-api in parallel, depend on all packages)

## 💻 Development Workflows

### Available Commands

```bash
# Development
pnpm run dev                    # Start all apps in development mode
pnpm run dev:webapp            # Start only webapp in development
pnpm run dev:mcp-api           # Start only mcp-api in development

# Building
pnpm run build                 # Build all packages and apps
pnpm run build --filter=webapp # Build only webapp and its dependencies

# Testing
pnpm run test:unit             # Run unit tests across all packages
pnpm run test:unit:watch       # Run unit tests in watch mode
pnpm run test                  # Run all tests (including integration)

# Code Quality
pnpm run lint                  # Lint all packages and apps
pnpm run lint:fix              # Auto-fix linting issues

# Pre-push Validation
pnpm run pre:push              # Run lint + test:unit + build (CI simulation)
```

### Selective Package Operations

Target specific packages using filters:

```bash
# Build specific packages
pnpm run build --filter=@decision-copilot/domain
pnpm run build --filter=@decision-copilot/infrastructure

# Test specific packages
pnpm run test:unit --filter=domain

# Include dependencies automatically
pnpm run build --filter=webapp...  # Builds webapp and all its dependencies
```

## 🚀 Key Benefits

### 1. **Smart Caching**
- First build: Builds everything
- Subsequent builds: Only rebuilds changed packages
- Shared cache across team members (when configured)

### 2. **Parallel Execution**
- Independent packages build simultaneously
- Maximizes CPU utilization during builds
- Faster overall build times

### 3. **Incremental Development**
- Change one package, only rebuild what's affected
- Fast feedback loops for developers
- Efficient CI/CD pipelines

### 4. **Code Reuse**
- Domain logic shared between webapp and API
- UI components reusable across applications
- Configuration consistency across packages

### 5. **Independent Deployment**
- Deploy webapp and mcp-api separately
- Different release cycles for different apps
- Reduced deployment risk

## 🏆 Architecture Advantages

### Separation of Concerns
- **Domain**: Pure business logic, framework-agnostic
- **Infrastructure**: Data access, external service integration
- **UI**: Presentation components, design system
- **Apps**: Application-specific logic and orchestration

### Scalability
- Add new applications easily (mobile app, admin dashboard)
- Extract common functionality to shared packages
- Independent team ownership of different packages

### Type Safety
- Shared TypeScript configurations ensure consistency
- Cross-package type checking at build time
- Refactoring safety across package boundaries

### Testing Strategy
- Unit tests run independently (fast feedback)
- Integration tests at application level
- Package-level test isolation

## 📈 Performance Characteristics

### Build Performance
- **Baseline**: ~4.9 seconds for full build
- **With cache**: Near-instant for unchanged code
- **Incremental**: Only rebuilds affected packages

### Development Experience
- **Fast startup**: Independent package development
- **Hot reloading**: Changes propagate quickly
- **Parallel testing**: Multiple test suites run simultaneously

This Turborepo layout provides a scalable, maintainable monorepo architecture that grows with your project while maintaining excellent developer experience and build performance.