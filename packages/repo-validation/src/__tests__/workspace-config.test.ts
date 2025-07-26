import { readFileSync, readdirSync, statSync, existsSync } from 'fs'
import { join, resolve } from 'path'
import { parse as parseJsonc } from 'jsonc-parser'
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
    return parseJsonc(content) as Record<string, unknown>
  } catch (error) {
    throw new Error(`Failed to parse JSON file ${filePath}: ${error}`)
  }
}

/**
 * Helper function to find all package directories
 */
function findPackageDirectories(): string[] {
  const packagesPath = join(MONOREPO_ROOT, 'packages')
  const appsPath = join(MONOREPO_ROOT, 'apps')
  
  const packageDirs: string[] = []
  
  // Add packages/*
  if (statSync(packagesPath).isDirectory()) {
    const packages = readdirSync(packagesPath)
    for (const pkg of packages) {
      const pkgPath = join(packagesPath, pkg)
      if (statSync(pkgPath).isDirectory()) {
        packageDirs.push(pkgPath)
      }
    }
  }
  
  // Add apps/*
  if (statSync(appsPath).isDirectory()) {
    const apps = readdirSync(appsPath)
    for (const app of apps) {
      const appPath = join(appsPath, app)
      if (statSync(appPath).isDirectory()) {
        packageDirs.push(appPath)
      }
    }
  }
  
  return packageDirs
}

describe('🔧 Workspace Configuration Validation', () => {
  describe('TypeScript Build Configuration', () => {
    const packageDirs = findPackageDirectories()
    
    // Filter to only packages that have tsconfig.build.json
    const packagesWithTsBuild = packageDirs.filter(packageDir => {
      const tsconfigBuildPath = join(packageDir, 'tsconfig.build.json')
      return existsSync(tsconfigBuildPath)
    })
    
    packagesWithTsBuild.forEach(packageDir => {
      const packageName = packageDir.split('/').pop() || 'unknown'
      
      describe(`${packageName} TypeScript configuration`, () => {
        const tsconfigBuildPath = join(packageDir, 'tsconfig.build.json')
        
        it('should have required build configuration settings', () => {
          const buildConfig = readJsonFile(tsconfigBuildPath)
          
          const compilerOptions = buildConfig.compilerOptions || {}
          
          // Test 1: outDir should be "dist"
          expect(compilerOptions.outDir, 
            `${packageName}: outDir must be "dist" (found: ${compilerOptions.outDir})`
          ).toBe('dist')
          
          // Test 2: rootDir should be "src" 
          expect(compilerOptions.rootDir,
            `${packageName}: rootDir must be "src" (found: ${compilerOptions.rootDir})`
          ).toBe('src')
          
          // Test 3: tsBuildInfoFile should follow the pattern ".turbo/[package-name].tsbuildinfo"
          const expectedBuildInfoFile = `.turbo/${packageName}.tsbuildinfo`
          expect(compilerOptions.tsBuildInfoFile,
            `${packageName}: tsBuildInfoFile must be "${expectedBuildInfoFile}" (found: ${compilerOptions.tsBuildInfoFile})`
          ).toBe(expectedBuildInfoFile)
        })
        
        it('should have consistent path resolution settings', () => {
          const buildConfig = readJsonFile(tsconfigBuildPath)
          
          const compilerOptions = buildConfig.compilerOptions || {}
          
          // These settings cannot be centralized due to path resolution issues
          // Each package must define them individually
          expect(compilerOptions.outDir, 
            `${packageName}: outDir cannot be centralized - must be defined in tsconfig.build.json`
          ).toBeDefined()
          
          expect(compilerOptions.rootDir,
            `${packageName}: rootDir cannot be centralized - must be defined in tsconfig.build.json`  
          ).toBeDefined()
          
          expect(compilerOptions.tsBuildInfoFile,
            `${packageName}: tsBuildInfoFile must be defined to prevent Turbo "no output files found" warnings`
          ).toBeDefined()
        })
      })
    })
  })

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