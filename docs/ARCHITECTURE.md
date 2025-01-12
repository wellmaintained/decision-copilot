# Decision Copilot Architecture

This document outlines the high-level architecture of the Decision Copilot application, a Next.js-based web application for managing decision-making processes.

## Directory Structure

```sh
├── .env.{development,production} # Env specific environment variables & secrets (not committed to git)
├── .env                          # Default environment variables (can be committed)
├── app/                          # Next.js app directory (pages and layouts)
├── components/                   # Reusable React components
├── hooks/                        # Custom React hooks
├── lib/                          # Core application logic
│   ├── domain/                   # Domain models (objects and props) and repository interfaces
│   └── infrastructure/           # Repository implementations
├── public/                       # Static assets
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

### Domain Objects and Validation

Domain objects use Props interfaces and class-validator decorators to ensure data validity. Here's how this works with our Decision domain:

```typescript
// Props interfaces define the data structure
interface DecisionProps {
  id: string
  title: string
  description: string
  status: 'draft' | 'published' | 'archived'
  criteria: DecisionCriterionProps[]
  projectId: string
  publishedAt?: Date
}

interface DecisionCriterionProps {
  name: string
  description: string
}

// Domain objects contain validation and business logic
class Decision {
  readonly id: string

  @IsString()
  @MinLength(5)
  readonly title: string

  @IsString()
  @IsNotEmpty()
  readonly description: string

  @IsEnum(['draft', 'published', 'archived'])
  readonly status: 'draft' | 'published' | 'archived'

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DecisionCriterion)
  readonly criteria: DecisionCriterion[]

  @IsUUID()
  readonly projectId: string

  @IsDate()
  @IsOptional()
  readonly publishedAt?: Date

  private constructor(props: DecisionProps) {
    this.id = props.id
    this.title = props.title
    this.description = props.description
    this.status = props.status
    this.criteria = props.criteria.map(c => DecisionCriterion.create(c))
    this.projectId = props.projectId
    this.publishedAt = props.publishedAt
    this.validate()
  }

  private validate(): void {
    const errors = validateSync(this)
    if (errors.length > 0) {
      throw new DomainValidationError(errors)
    }
  }

  static create(props: DecisionProps): Decision {
    return new Decision(props)
  }

  publish(): Decision {
    if (this.status !== 'draft') {
      throw new Error('Can only publish draft decisions')
    }

    return Decision.create({
      ...this,
      status: 'published',
      publishedAt: new Date()
    })
  }
}
```

Key patterns:
- Props interfaces define the shape of data without validation logic
- Domain objects use class-validator decorators for validation rules
- Private constructors with static factory methods ensure valid construction
- Immutable properties prevent unauthorized modifications
- Business logic methods (like `publish()`) return new instances
- Nested validation for complex objects (like criteria)

### Repository Pattern

The repository pattern provides a type-safe abstraction for data persistence:

```typescript
// Repository interface in domain layer
interface DecisionsRepository {
  create(props: Omit<DecisionProps, 'id'>): Promise<Decision>
  getById(id: string): Promise<Decision | null>
  update(decision: Decision): Promise<void>
  delete(id: string): Promise<void>
  getByProject(projectId: string): Promise<Decision[]>
}

// Implementation in infrastructure layer
class FirestoreDecisionsRepository implements DecisionsRepository {
  async create(props: Omit<DecisionProps, 'id'>): Promise<Decision> {
    const docRef = await addDoc(collection(db, 'decisions'), {
      ...props,
      createdAt: new Date()
    })

    return Decision.create({
      ...props,
      id: docRef.id
    })
  }

  async getById(id: string): Promise<Decision | null> {
    const doc = await getDoc(doc(db, 'decisions', id))
    if (!doc.exists()) return null

    return Decision.create({
      id: doc.id,
      ...doc.data()
    })
  }
}
```

Key aspects:
- Repository interfaces define type-safe data access methods
- Firestore implementation handles data conversion
- Domain objects are always created through factory methods
- Validation is automatically enforced on data retrieval
- Repository methods work with both Props and Domain objects

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
