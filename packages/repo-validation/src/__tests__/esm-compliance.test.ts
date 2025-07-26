import { readFileSync, readdirSync, statSync } from 'fs'
import { join, resolve } from 'path'
import { parse as parseJsonc } from 'jsonc-parser'
import { describe, it, expect } from 'vitest'

/**
 * ESM Compliance Tests
 * 
 * Part of @decision-copilot/repo-validation - Repository-level validation tests.
 * 
 * These tests prevent CommonJS regression that would break Firebase OAuth authentication.
 * 
 * CRITICAL: Firebase SDK requires ESM compilation for OAuth URL generation to work correctly.
 * CommonJS compilation creates proxy objects that corrupt Firebase's internal provider registration,
 * resulting in OAuth URLs missing `&providerId=google.com` parameters.
 */

// Get the monorepo root directory
const MONOREPO_ROOT = resolve(process.cwd(), '../..')

// Paths to validate
const CONFIG_TYPESCRIPT_PATH = join(MONOREPO_ROOT, 'packages/config-typescript')
const PACKAGES_PATH = join(MONOREPO_ROOT, 'packages')
const APPS_PATH = join(MONOREPO_ROOT, 'apps')

/**
 * Helper function to read and parse JSON files safely (supports JSONC with comments)
 */
function readJsonFile(filePath: string): Record<string, unknown> {
  try {
    const content = readFileSync(filePath, 'utf-8')
    return parseJsonc(content) as Record<string, unknown>
  } catch {
    throw new Error(`Failed to read JSON file ${filePath}`)
  }
}

/**
 * Helper function to find all directories in a path
 */
function getDirectories(path: string): string[] {
  try {
    return readdirSync(path).filter(item => {
      const itemPath = join(path, item)
      return statSync(itemPath).isDirectory() && !item.startsWith('.')
    })
  } catch {
    // Path doesn't exist or can't be read
    return []
  }
}

/**
 * Helper function to get all package directories
 */
function getAllPackageDirectories(): string[] {
  const packageDirs = getDirectories(PACKAGES_PATH).map(dir => join(PACKAGES_PATH, dir))
  const appDirs = getDirectories(APPS_PATH).map(dir => join(APPS_PATH, dir))
  return [...packageDirs, ...appDirs]
}

describe('🚨 ESM Compliance - Firebase OAuth Dependency', () => {
  describe('TypeScript Configuration Validation', () => {
    it('should enforce ESNext modules in base.json (CRITICAL for Firebase OAuth)', () => {
      const baseConfigPath = join(CONFIG_TYPESCRIPT_PATH, 'base.json')
      const config = readJsonFile(baseConfigPath)
      
      expect(config.compilerOptions.module).toBe('ESNext')
      expect(config.compilerOptions.moduleResolution).toBe('bundler')
    })

    it('should never override module settings with CommonJS in specialized configs', () => {
      const configFiles = ['node.json', 'react-library.json', 'nextjs.json']
      
      for (const configFile of configFiles) {
        const configPath = join(CONFIG_TYPESCRIPT_PATH, configFile)
        const config = readJsonFile(configPath)
        
        // If module is specified, it must be ESM-compatible (ESNext or esnext)
        if (config.compilerOptions.module !== undefined) {
          const moduleValue = config.compilerOptions.module.toLowerCase()
          expect(moduleValue, `${configFile} module setting must be ESM-compatible`).toMatch(/^(esnext|es2015|es2020|es2022)$/i)
        }
        
        // If moduleResolution is specified, it must be ESM-compatible (bundler or node16+)
        if (config.compilerOptions.moduleResolution !== undefined) {
          const moduleResValue = config.compilerOptions.moduleResolution.toLowerCase()
          expect(moduleResValue, `${configFile} moduleResolution must be ESM-compatible`).toMatch(/^(bundler|node16|nodenext)$/i)
        }
        
        // Most importantly, never allow CommonJS
        expect(config.compilerOptions.module, `${configFile} must not use CommonJS`).not.toBe('commonjs')
        expect(config.compilerOptions.moduleResolution, `${configFile} must not use node resolution`).not.toBe('node')
      }
    })

    it('should extend from base.json in all specialized configs', () => {
      const configFiles = ['node.json', 'react-library.json', 'nextjs.json']
      
      for (const configFile of configFiles) {
        const configPath = join(CONFIG_TYPESCRIPT_PATH, configFile)
        const config = readJsonFile(configPath)
        
        expect(config.extends).toBe('./base.json')
      }
    })
  })

  describe('Package.json ESM Configuration', () => {
    it('should have "type": "module" in all packages', () => {
      const packageDirs = getAllPackageDirectories()
      
      expect(packageDirs.length).toBeGreaterThan(0) // Ensure we found packages
      
      for (const packageDir of packageDirs) {
        const packageJsonPath = join(packageDir, 'package.json')
        
        try {
          const packageJson = readJsonFile(packageJsonPath)
          const packageName = packageJson.name || packageDir
          
          expect(packageJson.type, `${packageName} must have "type": "module" for ESM compilation`).toBe('module')
        } catch {
          // Skip directories without package.json (not a package)
          continue
        }
      }
    })

    it('should have "type": "module" in root package.json', () => {
      const rootPackageJsonPath = join(MONOREPO_ROOT, 'package.json')
      const packageJson = readJsonFile(rootPackageJsonPath)
      
      // Root might not have type: module if it's just a workspace root
      // But if it has a type field, it should be 'module'
      if (packageJson.type !== undefined) {
        expect(packageJson.type).toBe('module')
      }
    })
  })

  describe('Source Code CommonJS Detection', () => {
    it('should not contain require() statements in source code', () => {
      const packageDirs = getAllPackageDirectories()
      const forbiddenPatterns = [
        /(?<!['"])\brequire\s*\(/,  // require( as a function call, not in strings
        /\bmodule\.exports\b/,      // module.exports
        /\bexports\s*\[/           // exports[
      ]
      
      for (const packageDir of packageDirs) {
        const srcPath = join(packageDir, 'src')
        
        try {
          const checkDirectory = (dirPath: string) => {
            const items = readdirSync(dirPath)
            
            for (const item of items) {
              const itemPath = join(dirPath, item)
              const stat = statSync(itemPath)
              
              if (stat.isDirectory()) {
                checkDirectory(itemPath) // Recursive check
              } else if (item.match(/\.(ts|tsx|js|jsx)$/) && !item.includes('.test.')) {
                // Skip test files - they may contain CommonJS references for validation
                const content = readFileSync(itemPath, 'utf-8')
                
                for (const pattern of forbiddenPatterns) {
                  const matches = content.match(pattern)
                  if (matches) {
                    throw new Error(
                      `Found CommonJS syntax in ${itemPath}: "${matches[0]}" - ` +
                      `This will break Firebase OAuth authentication. Use ES6 imports instead.`
                    )
                  }
                }
              }
            }
          }
          
          if (statSync(srcPath).isDirectory()) {
            checkDirectory(srcPath)
          }
        } catch (error) {
          if (error instanceof Error && error.message.includes('Found CommonJS syntax')) {
            throw error // Re-throw our custom error
          }
          // Skip directories without src folder or other file system errors
          continue
        }
      }
    })
  })

  describe('Build Output Validation', () => {
    it('should generate ES modules in build output', () => {
      // This test checks that compiled output uses ES module syntax
      const packageDirs = getAllPackageDirectories()
      
      for (const packageDir of packageDirs) {
        const libPath = join(packageDir, 'lib')
        const distPath = join(packageDir, 'dist')
        
        // Check lib directory first (preferred output location)
        let outputPath = libPath
        try {
          statSync(libPath)
        } catch {
          // Try dist directory if lib doesn't exist
          try {
            statSync(distPath)
            outputPath = distPath
          } catch {
            // No build output found, skip this package
            continue
          }
        }
        
        // Find .js files in the output directory
        const checkOutputDirectory = (dirPath: string) => {
          try {
            const items = readdirSync(dirPath)
            
            for (const item of items) {
              const itemPath = join(dirPath, item)
              const stat = statSync(itemPath)
              
              if (stat.isDirectory()) {
                checkOutputDirectory(itemPath) // Recursive check
              } else if (item.endsWith('.js')) {
                const content = readFileSync(itemPath, 'utf-8')
                
                // Check for CommonJS patterns in compiled output (but allow require.main for entry point detection)
                const hasModuleExports = content.includes('module.exports')
                const hasExportsDot = content.includes('exports.') && !content.includes('require.main')
                const hasObjectDefineProperty = content.includes('Object.defineProperty(exports,')
                
                if (hasModuleExports || hasExportsDot || hasObjectDefineProperty) {
                  const packageJson = readJsonFile(join(packageDir, 'package.json'))
                  const packageName = packageJson.name || packageDir
                  
                  throw new Error(
                    `Found CommonJS syntax in compiled output ${itemPath} for package ${packageName}. ` +
                    `This indicates TypeScript is compiling to CommonJS instead of ESM, ` +
                    `which will break Firebase OAuth authentication.`
                  )
                }
              }
            }
          } catch (error) {
            if (error instanceof Error && error.message.includes('Found CommonJS syntax')) {
              throw error
            }
            // Skip file system errors
          }
        }
        
        checkOutputDirectory(outputPath)
      }
    })
  })

  describe('Firebase OAuth Regression Detection', () => {
    it('should not find any configuration that would break Firebase OAuth', () => {
      // This is a comprehensive check that combines all the above validations
      // into a single test that specifically focuses on Firebase OAuth compatibility
      
      const issues: string[] = []
      
      // Check base TypeScript config
      try {
        const baseConfig = readJsonFile(join(CONFIG_TYPESCRIPT_PATH, 'base.json'))
        if (baseConfig.compilerOptions.module !== 'ESNext') {
          issues.push(`base.json has module: "${baseConfig.compilerOptions.module}" instead of "ESNext"`)
        }
        if (baseConfig.compilerOptions.moduleResolution !== 'bundler') {
          issues.push(`base.json has moduleResolution: "${baseConfig.compilerOptions.moduleResolution}" instead of "bundler"`)
        }
      } catch (error) {
        issues.push(`Could not read base.json: ${error}`)
      }
      
      // Check package.json files
      const packageDirs = getAllPackageDirectories()
      for (const packageDir of packageDirs) {
        const packageJsonPath = join(packageDir, 'package.json')
        
        try {
          const packageJson = readJsonFile(packageJsonPath)
          if (packageJson.type !== 'module') {
            issues.push(`${packageJson.name || packageDir} package.json missing "type": "module"`)
          }
        } catch {
          // Skip directories without package.json
          continue
        }
      }
      
      if (issues.length > 0) {
        throw new Error(
          `Firebase OAuth compatibility issues detected:\n\n` +
          issues.map(issue => `❌ ${issue}`).join('\n') +
          `\n\n🔥 These issues will cause Firebase OAuth URLs to be missing ` +
          `"&providerId=google.com" parameters, preventing successful authentication.\n\n` +
          `See CLAUDE.md and packages/config-typescript/README.md for fix instructions.`
        )
      }
    })
  })
})