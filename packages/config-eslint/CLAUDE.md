# config-eslint

Shared ESLint configuration for the Decision Copilot monorepo.

## Configuration Testing

**IMPORTANT: Add tests when making configuration changes**

When modifying ESLint configurations in this package, always add validation tests to `packages/repo-validation/src/__tests__/workspace-config.test.ts` to ensure:

1. **Consistency across packages** - All packages follow the same linting patterns
2. **Prevent regressions** - Rule changes don't break existing code
3. **Catch missing rules** - Important linting rules are not omitted
4. **Cross-package compatibility** - Rules work across different project types

### Example Test Patterns

For ESLint configuration changes, consider testing:
- Required rules are enabled consistently
- Import/export rules work with monorepo structure
- Framework-specific rules (React, Node.js) are properly configured
- Custom rules are applied correctly

### Why Test Configuration?

ESLint configuration bugs can cause:
- Inconsistent code style across packages
- Missing important error detection
- Build failures in CI/CD
- Developer experience issues

Always validate configuration changes with automated tests to maintain code quality standards.