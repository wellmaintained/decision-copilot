# @decision-copilot/config-typescript

This package contains the shared TypeScript configurations for the monorepo, ensuring consistency and maintainability across all packages and applications.

Using TypeScript Project References, these configurations are chained together to provide a robust and scalable type-checking environment.

## Available Configurations

### `base.json`

This is the foundational configuration that all other configs inherit from. It contains the strictest and most common settings that apply to all TypeScript code in the project.

-   **Strictness**: Enables all `strict` family options (`strict`, `noImplicitAny`, `strictNullChecks`, etc.).
-   **Module Settings**: Enforces `commonjs` module format for compatibility across Node.js, Next.js, and tooling.
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