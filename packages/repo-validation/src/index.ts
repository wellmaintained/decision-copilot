/**
 * @decision-copilot/repo-validation
 * 
 * Repository-level validation tests for monorepo configuration, setup, and standards.
 * 
 * This package contains automated tests that validate repository-wide concerns:
 * 
 * ## ESM Compliance Tests
 * - TypeScript configurations use ESNext modules
 * - Package.json files have "type": "module" 
 * - Source code doesn't use CommonJS syntax
 * - Build output generates ESM modules
 * - CRITICAL: Prevents Firebase OAuth authentication breakage
 * 
 * ## Future Test Categories
 * - Workspace configuration validation
 * - Dependency management standards
 * - Build system configuration
 * - Code style and formatting consistency
 * - Security policy compliance
 */

export const REPO_VALIDATION_INFO = {
  purpose: 'Validate repository-wide configuration, setup, and standards',
  testCategories: {
    esmCompliance: {
      purpose: 'Prevent CommonJS regression that breaks Firebase OAuth',
      criticalDependency: 'Firebase SDK requires ESM for OAuth URL generation',
      testTypes: [
        'TypeScript configuration validation',
        'Package.json ESM validation', 
        'Source code CommonJS detection',
        'Build output validation',
        'Firebase OAuth regression detection'
      ]
    },
    // Future categories can be added here
    workspaceConfig: {
      purpose: 'Validate workspace and monorepo configuration',
      testTypes: [
        'pnpm-workspace.yaml validation',
        'turbo.json consistency checks',
        'Package dependency validation'
      ]
    }
  }
} as const

export default REPO_VALIDATION_INFO