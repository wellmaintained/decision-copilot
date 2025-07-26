# config-typescript

Shared TypeScript configuration for the Decision Copilot monorepo.

## Configuration Testing

**IMPORTANT: Add tests when making configuration changes**

When modifying TypeScript configurations in this package, always add validation tests to `packages/repo-validation/src/__tests__/workspace-config.test.ts` to ensure:

1. **Consistency across packages** - All packages follow the same patterns
2. **Prevent regressions** - Changes don't break existing functionality  
3. **Catch missing settings** - Required configurations are not omitted

### Example Test Patterns

For TypeScript configuration changes, consider testing:
- Required compiler options are present
- Path resolution settings are consistent
- Build artifacts are properly configured
- Cross-package compatibility is maintained

### Why Test Configuration?

Configuration bugs can be subtle and hard to catch:
- Missing `tsBuildInfoFile` causes Turbo "no output files found" warnings
- Incorrect path resolution breaks builds
- Inconsistent settings cause mysterious compilation errors

Always validate configuration changes with automated tests to maintain workspace stability.