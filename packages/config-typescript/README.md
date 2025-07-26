# @decision-copilot/config-typescript

This package contains the shared TypeScript configurations for the monorepo, ensuring consistency and maintainability across all packages and applications.

Using TypeScript Project References, these configurations are chained together to provide a robust and scalable type-checking environment.

## Available Configurations

### `base.json`

This is the foundational configuration that all other configs inherit from. It contains the strictest and most common settings that apply to all TypeScript code in the project.

-   **Strictness**: Enables all `strict` family options (`strict`, `noImplicitAny`, `strictNullChecks`, etc.).
-   **Module Settings**: Enforces `ESNext` module format for modern JavaScript and optimal Firebase SDK compatibility.
-   **Code Quality**: Includes rules like `noUnusedLocals` and `noUnusedParameters` to keep the codebase clean.
-   **ESLint Interop**: `"esModuleInterop": true` is set for compatibility with how various tools handle module imports.

**When to use**: You should almost never use this directly. Instead, extend from one of the more specific configurations below.

---

### `node.json`

This configuration is designed for packages that run in a standard Node.js environment, such as backend services, CLIs, or scripts.

-   **Extends**: `base.json`
-   **Environment**: Targets a modern Node.js environment (e.g., `ES2022`).
-   **Usage**: Ideal for `apps/admin`, `apps/mcp-api`, and any other backend packages.

---

### `react-library.json`

This configuration is for shared React component libraries that are not Next.js applications.

-   **Extends**: `base.json`
-   **JSX**: Configured with `"jsx": "react-jsx"` for modern React 17+ JSX transform.
-   **DOM Types**: Includes the `"dom"` library to make browser-native types like `HTMLElement` available.
-   **Usage**: Perfect for the `packages/ui` package.

---

### `nextjs.json`

This is a specialized configuration for Next.js applications. It is tailored to work with Next.js's compiler and build process.

-   **Extends**: `base.json`
-   **JSX**: Configured specifically for Next.js (`"jsx": "preserve"`).
-   **Module Resolution**: Includes settings like `"moduleResolution": "bundler"` which is what Next.js expects.
-   **Plugins**: Integrates with the `"next"` compiler plugin for build-time optimizations.
-   **Usage**: Exclusively for the `apps/webapp` application.

---

## 🚨 **CRITICAL: ESM Module System**

### **Why ESM is Required**

This monorepo uses **ESNext modules** (`"module": "ESNext"`) throughout all TypeScript configurations. This is **not optional** and is critical for several reasons:

1. **🔥 Firebase SDK Compatibility**: Our Firebase OAuth authentication **will break** if compiled to CommonJS
   - Firebase SDK requires direct object references for OAuth URL generation
   - CommonJS compilation creates indirect references that corrupt the SDK's internal state
   - **Symptom**: OAuth URLs missing `&providerId=google.com` parameters

2. **🚀 Modern JavaScript**: ESM is the standard module system for modern JavaScript
3. **📦 Better Tree Shaking**: Improved bundle optimization and smaller builds
4. **⚡ Performance**: Parallel module loading vs synchronous CommonJS

### **ESM Migration Completed**

✅ **All packages migrated to ESM**:
- `packages/domain` - Core business logic with decorators ✅
- `packages/ui` - React components ✅ 
- `packages/test-utils` - Testing utilities ✅
- `packages/infrastructure` - Firebase integration ✅
- All other packages ✅

### **⚠️ Regression Prevention**

**NEVER do the following** (will break Firebase OAuth):

❌ **DON'T override module settings**:
```json
// DON'T DO THIS in specialized configs
{
  "compilerOptions": {
    "module": "commonjs",        // ← Will break Firebase OAuth
    "moduleResolution": "node"   // ← Will break Firebase OAuth
  }
}
```

❌ **DON'T remove "type": "module"** from package.json files

❌ **DON'T use require()** in source code - use ES6 imports instead

### **✅ New Package Checklist**

When creating new packages, **always**:

1. **Add to package.json**:
   ```json
   {
     "type": "module"
   }
   ```

2. **Use proper TypeScript config**:
   - Extend from `base.json`, `node.json`, `react-library.json`, or `nextjs.json`
   - **Never override** `module` or `moduleResolution` settings

3. **Use ES6 imports**:
   ```typescript
   // ✅ Good
   import { something } from './module';
   export { something };
   
   // ❌ Bad - don't use
   const something = require('./module');
   module.exports = something;
   ```

### **🔧 Validation**

The monorepo includes automated tests to prevent CommonJS regression:
- Config file validation (ensures `"module": "ESNext"`)
- Package.json validation (ensures `"type": "module"`)
- Build output verification (ensures ESM compilation)

If you see Firebase OAuth errors with missing `providerId` parameters, check for CommonJS regression. 