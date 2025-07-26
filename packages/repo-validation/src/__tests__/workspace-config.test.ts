import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { describe, it, expect } from 'vitest'

/**
 * Workspace Configuration Tests
 * 
 * Part of @decision-copilot/repo-validation - Repository-level validation tests.
 * 
 * These tests validate monorepo workspace configuration and consistency.
 */

// Get the monorepo root directory
const MONOREPO_ROOT = resolve(process.cwd(), '../..')

/**
 * Helper function to read and parse JSON/YAML files safely
 */
function readTextFile(filePath: string): string {
  try {
    return readFileSync(filePath, 'utf-8')
  } catch (error) {
    throw new Error(`Failed to read file ${filePath}: ${error}`)
  }
}

function readJsonFile(filePath: string): Record<string, unknown> {
  try {
    const content = readTextFile(filePath)
    return JSON.parse(content)
  } catch (error) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${error}`)
  }
}

describe('🔧 Workspace Configuration Validation', () => {
  describe('pnpm Workspace Configuration', () => {
    it('should have valid pnpm-workspace.yaml', () => {
      const workspaceFile = join(MONOREPO_ROOT, 'pnpm-workspace.yaml')
      const content = readTextFile(workspaceFile)
      
      // Basic validation - should contain packages definition
      expect(content).toContain('packages:')
      expect(content).toContain('- apps/*')
      expect(content).toContain('- packages/*')
    })

    it('should have consistent packageManager in root package.json', () => {
      const packageJsonPath = join(MONOREPO_ROOT, 'package.json')
      const packageJson = readJsonFile(packageJsonPath)
      
      expect(packageJson.packageManager).toBeDefined()
      expect(packageJson.packageManager).toMatch(/^pnpm@/)
    })
  })

  describe('Turbo Configuration', () => {
    it('should have valid turbo.json configuration', () => {
      const turboConfigPath = join(MONOREPO_ROOT, 'turbo.json')
      const turboConfig = readJsonFile(turboConfigPath)
      
      // Should have essential tasks defined
      expect(turboConfig.tasks).toBeDefined()
      expect(turboConfig.tasks.build).toBeDefined()
      expect(turboConfig.tasks.test).toBeDefined()
      expect(turboConfig.tasks['test:unit']).toBeDefined()
      expect(turboConfig.tasks.lint).toBeDefined()
    })

    it('should have pre:push task with proper dependencies', () => {
      const turboConfigPath = join(MONOREPO_ROOT, 'turbo.json')
      const turboConfig = readJsonFile(turboConfigPath)
      
      const prePushTask = turboConfig.tasks['pre:push']
      expect(prePushTask).toBeDefined()
      expect(prePushTask.dependsOn).toContain('lint')
      expect(prePushTask.dependsOn).toContain('test:unit')
      expect(prePushTask.dependsOn).toContain('build')
    })
  })

  // Placeholder for future workspace validation tests
  describe.skip('Future Workspace Validations', () => {
    it.skip('should validate consistent dependency versions across packages', () => {
      // TODO: Implement cross-package dependency version consistency checks
    })

    it.skip('should validate workspace package naming conventions', () => {
      // TODO: Implement package naming convention validation
    })

    it.skip('should validate build output consistency', () => {
      // TODO: Implement build output structure validation
    })
  })
})