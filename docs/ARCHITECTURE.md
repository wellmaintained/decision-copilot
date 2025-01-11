# Decision Copilot Architecture

This document outlines the high-level architecture of the Decision Copilot application, a Next.js-based web application for managing decision-making processes.

## Directory Structure

```sh
.
├── app/                 # Next.js app directory (pages and layouts)
├── components/          # Reusable React components
├── hooks/               # Custom React hooks
├── lib/                 # Core application logic
│   ├── domain/          # Domain models and interfaces
│   └── infrastructure/  # External service implementations
├── public/              # Static assets
```

## Technology Stack

- **Framework**: Next.js 15.1 with React 19
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **Database**: Firebase Firestore
- **Authentication**: Firebase Auth
- **State Management**: React Hooks + Custom Hooks
- **Form Handling**: React Hook Form
- **Data Visualization**: Recharts

## Application Layers

### 1. Presentation Layer (`app/` directory)
- Uses Next.js App Router for routing and layouts
- Pages are organized by feature (e.g., `/dashboard`, `/decision`)
- Layouts provide consistent UI structure across pages
- Server components for improved performance where possible

### 2. Component Layer (`components/` directory)
- Reusable UI components built with shadcn/ui and Radix UI primitives
- Components follow atomic design principles
- Styled using Tailwind CSS with consistent design tokens

### 3. Application Layer (`hooks/` directory)
- Custom React hooks for shared business logic
- Data fetching and state management
- Form handling and validation

### 4. Domain Layer (`lib/domain/`)
- Core business logic and domain models
- Repository interfaces for data access
- Type definitions and validation rules
- Domain entities (Decision, Stakeholder, etc.)

### 5. Infrastructure Layer (`lib/infrastructure/`)
- Firestore repository implementations
- Firebase configuration and setup
- External service integrations

## Data Flow

1. UI components trigger actions through custom hooks
2. Hooks interact with domain repositories
3. Domain repositories are implemented by infrastructure layer
4. Infrastructure layer communicates with Firestore
5. Data flows back through the same layers with type safety

## Key Dependencies

- **UI Components**: shadcn/ui, @radix-ui/* primitives
- **Styling**: tailwindcss, class-variance-authority
- **Forms**: react-hook-form
- **Validation**: class-validator
- **Database**: firebase
- **Icons**: lucide-react
- **Animations**: framer-motion

## Import Convention

The application uses absolute imports with the `@/` prefix:

```typescript
import { Decision } from '@/lib/domain/Decision'
import { useDecisions } from '@/hooks/useDecisions'
```

This provides clearer import paths and better maintainability compared to relative imports.
