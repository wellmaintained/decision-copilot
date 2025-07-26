# config-vitest

Shared Vitest configuration for the Decision Copilot monorepo.

## Configuration Testing

**IMPORTANT: Add tests when making configuration changes**

When modifying Vitest configurations in this package, always add validation tests to `packages/repo-validation/src/__tests__/workspace-config.test.ts` to ensure:

1. **Consistency across packages** - All packages follow the same testing patterns
2. **Prevent regressions** - Configuration changes don't break existing tests
3. **Catch missing settings** - Required test configurations are not omitted
4. **Cross-package compatibility** - Test configs work across different project types

### Example Test Patterns

For Vitest configuration changes, consider testing:
- Test file patterns are correctly configured
- Coverage settings are consistent
- Environment setup works properly
- Integration with TypeScript and other tools

### Why Test Configuration?

Vitest configuration bugs can cause:
- Tests not running or being discovered
- Incorrect coverage reporting
- Environment setup failures
- Inconsistent testing behavior across packages

Always validate configuration changes with automated tests to maintain reliable testing infrastructure.