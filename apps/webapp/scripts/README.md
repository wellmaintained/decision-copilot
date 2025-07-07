# Decision Copilot Admin Scripts

This directory contains administrative scripts for managing the Decision Copilot application.

## Migration Scripts

The Decision Copilot application has undergone a structural change in how projects and decisions are stored:

1. **Old Structure**: Hierarchical organization with projects as subcollections of teams and decisions as subcollections of projects
   ```
   organisations/{orgId}/teams/{teamId}/projects/{projectId}
   organisations/{orgId}/teams/{teamId}/projects/{projectId}/decisions/{decisionId}
   ```

2. **New Structure**: Flat organization with projects and decisions as direct subcollections of organisations
   ```
   organisations/{orgId}/projects/{projectId}
   organisations/{orgId}/decisions/{decisionId}
   ```

The migration script handles this transition seamlessly.

### migrate.ts

This script performs a comprehensive migration in two parts:

#### Project Migration

Migrates projects from the old hierarchical structure to the new flat structure:

- **From**: `organisations/{orgId}/teams/{teamId}/projects`
- **To**: `organisations/{orgId}/projects`

During migration, the script:
- Preserves all project data
- Removes the `teamId` field from project documents
- Ensures no duplicate projects are created

#### Decision Migration

Performs a comprehensive migration of decisions in two steps:

1. **Location Migration**:
   - **From**: `organisations/{orgId}/teams/{teamId}/projects/{projectId}/decisions`
   - **To**: `organisations/{orgId}/decisions`

2. **Structure Migration**:
   - **From**: Single `teamId` and `projectId` fields
   - **To**: Array-based `teamIds` and `projectIds` fields for multi-team and multi-project support

### Usage

The migration script can be run using the following commands:

```bash
pnpm migrate -e emulator -d  # Dry run
pnpm migrate -e emulator     # Actual migration
```

#### Implementation Details

The migration script (`migrate.ts`) includes functionality to:
- Run in dry-run mode to preview changes
- Enable verbose logging
- Connect to different environments (emulator or production)

The script always runs migrations in the correct order (projects first, then decisions) to maintain data integrity.

#### Prerequisites

- Node.js 18+ and pnpm installed
- Firebase CLI installed and configured
- For production migrations: a service account JSON file with Firestore access

#### Usage Examples

```bash
# Install dependencies if needed
pnpm install

# Run against the local emulator (dry run)
pnpm migrate -e emulator -d -v  # Verbose dry run

# Run against the local emulator (actual migration)
pnpm migrate -e emulator -v     # Verbose actual migration

# Run against production (dry run)
pnpm migrate -e production -d -s ./path/to/service-account.json

# Run against production (actual migration)
pnpm migrate -e production -s ./path/to/service-account.json
```

#### Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--environment <env>` | `-e` | Target environment (emulator, production, etc.) | `emulator` |
| `--dry-run` | `-d` | Run without making actual changes | `false` |
| `--service-account <path>` | `-s` | Path to service account JSON file (required for non-emulator environments) | - |
| `--emulator-host <host>` | - | Firestore emulator host | `localhost` |
| `--emulator-port <port>` | - | Firestore emulator port | `8080` |
| `--verbose` | `-v` | Enable verbose logging | `false` |

#### Migration Process Details

The project migration script performs the following steps:

1. Traverses the old hierarchical path: `organisations/{orgId}/teams/{teamId}/projects`
2. For each project found, creates a new document in the flat structure: `organisations/{orgId}/projects`
3. Removes the `teamId` field from the project data
4. Removes the old document after successful migration

The decision migration script performs the following steps:

1. **Hierarchical Structure Migration**:
   - Traverses the old hierarchical path: `organisations/{orgId}/teams/{teamId}/projects/{projectId}/decisions`
   - For each decision found, creates a new document in the flat structure: `organisations/{orgId}/decisions`
   - Sets `teamIds` and `projectIds` arrays based on the hierarchical location
   - Removes the old document after successful migration

2. **Field Structure Migration**:
   - Processes all decisions in the new flat structure
   - For each decision with old `teamId` and `projectId` fields, creates new `teamIds` and `projectIds` arrays
   - Removes the old fields after successful migration

#### Safety Features

- Dry run mode to preview changes without modifying data
- Verbose logging option for detailed output
- Skips documents that already exist in the new structure
- Validates service account file existence and format
- Checks for existing documents to avoid duplicates

## Test Data Scripts

### create-test-decisions.ts

Creates test decisions with both old and new structures for testing the migration process.

### create-test-hierarchical-decisions.ts

Creates test decisions in the old hierarchical structure for testing the migration process.

Usage:
```bash
# Create test hierarchical decisions
pnpm create-test-hierarchical-data

# Create test decisions (mix of old and new structure)
pnpm create-test-data
```

These scripts are useful for testing the migration process in a controlled environment.

## Other Scripts

### copy-decisions.ts

Copies decisions between organisations.

### list-organisations.ts

Lists all organisations in the Firestore database. 