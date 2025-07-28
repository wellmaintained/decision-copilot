# Firebase App Hosting Configuration Guide

This document captures our learnings and decisions around configuring Firebase App Hosting for a Turborepo monorepo with pnpm workspaces.

## Key Learnings

### Environment Variables in Firebase App Hosting

Firebase App Hosting provides several automatically configured environment variables that we should **not** override:

#### Automatically Provided Variables
- **`NODE_ENV`**: Always set to `production` for all App Hosting builds
- **`FIREBASE_CONFIG`**: Server-side Firebase configuration (minimal - contains `projectId`, `storageBucket`, `databaseURL`)
- **`FIREBASE_WEBAPP_CONFIG`**: Complete client-side Firebase configuration (contains `apiKey`, `appId`, `authDomain`, etc.)

#### Custom Variables We Override
- **`NEXT_PUBLIC_BASE_URL`**: Environment-specific URLs (staging vs production)
- **`NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID`**: Database selection per environment
- **`GOOGLE_NODE_RUN_SCRIPTS`**: Build command for monorepo (`build:webapp`)

### Configuration Architecture

#### Base Configuration (`apphosting.yaml`)
Contains shared settings applied to all environments:
```yaml
scripts:
  runCommand: pnpm start:webapp

runConfig:
  minInstances: 0

env:
  - variable: GOOGLE_NODE_RUN_SCRIPTS
    value: build:webapp
    availability: [BUILD]
  - variable: NODE_ENV
    value: production
    availability: [BUILD, RUNTIME]
```

#### Environment Overrides
Override files should **only contain environment-specific values**:

**`apphosting.staging.yaml`**:
- `NEXT_PUBLIC_BASE_URL`: Staging URL
- `NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID`: Staging database

**`apphosting.prod.yaml`**:
- `NEXT_PUBLIC_BASE_URL`: Production URL  
- `NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID`: Production database

### Turbo Cache Configuration

#### Problem
Turbo was tracking Firebase configuration variables that change between build and runtime phases, causing unnecessary cache invalidation and container startup timeouts.

#### Solution
Updated `turbo.json` to only track variables that actually change between environments:

```json
{
  "tasks": {
    "build": {
      "env": [
        "NEXT_PUBLIC_BASE_URL",
        "NEXT_PUBLIC_FIREBASE_FIRESTORE_DATABASE_ID"
      ]
    }
  }
}
```

**Removed from tracking**:
- Individual `NEXT_PUBLIC_FIREBASE_*` variables (replaced by `FIREBASE_WEBAPP_CONFIG`)
- `FIREBASE_CONFIG` and `FIREBASE_WEBAPP_CONFIG` (automatically provided)
- `NODE_ENV` (always `production` in App Hosting)

### Firebase SDK Configuration Approaches

#### Individual Variables (Current - Recommended for Development)
```typescript
const firebaseConfig = {
  apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  // ...
};
const app = initializeApp(firebaseConfig);
```

**Pros**: 
- ✅ Excellent emulator support
- ✅ Type safety and validation
- ✅ Easy debugging
- ✅ Explicit configuration

**Cons**:
- ❌ More variables to manage

#### Automatic Configuration (Firebase App Hosting)
```typescript
const app = initializeApp(); // No config needed
```

**Pros**:
- ✅ Zero configuration
- ✅ Automatic environment isolation
- ✅ Prevents configuration drift

**Cons**:
- ❌ App Hosting specific
- ❌ Limited emulator compatibility
- ❌ Less control for debugging

### Development vs Production Strategy

#### Local Development (.env.development)
Continue using individual `NEXT_PUBLIC_FIREBASE_*` variables:
- Full control over emulator connections
- Easy environment switching
- Detailed debugging capabilities
- Works with existing Firebase emulator suite

#### Production (Firebase App Hosting)
Leverage automatic configuration:
- `FIREBASE_WEBAPP_CONFIG` provides complete client configuration
- `FIREBASE_CONFIG` provides server configuration
- No manual variable management needed

### Container Startup Issues and Solutions

#### Root Cause
1. **Redundant pnpm install**: Webapp build script had unnecessary `pnpm install`
2. **Cache invalidation**: Environment variables changing between build/runtime phases
3. **Rebuild during startup**: Turbo detected environment changes and rebuilt

#### Solutions Applied
1. **Removed redundant install**: Changed webapp build from `pnpm install && next build` to `next build`
2. **Optimized turbo cache**: Only track variables that should invalidate cache
3. **Cleaned configuration**: Removed unused variables and duplicated settings

### Environment Variable Lifecycle

#### Build Phase
Available variables:
- `NODE_ENV=production`
- `GOOGLE_NODE_RUN_SCRIPTS=build:webapp`
- `FIREBASE_WEBAPP_CONFIG={...}` (complete config)
- `FIREBASE_CONFIG={...}` (minimal config)
- Custom variables from `apphosting.yaml`

#### Runtime Phase  
Available variables:
- `NODE_ENV=production`
- `FIREBASE_CONFIG={...}` (minimal config)
- Custom variables with `availability: [RUNTIME]`
- **Missing**: `FIREBASE_WEBAPP_CONFIG` (build-time only)

### Database Configuration Issue

**Critical Finding**: Both staging and production were configured to use the same Firestore database (`decision-copilot-prod`) due to server-side logic using `NODE_ENV` for database selection.

Since Firebase App Hosting sets `NODE_ENV=production` for all builds, staging was connecting to production database.

**Recommendation**: Update server-side code to use environment-specific database configuration instead of `NODE_ENV`.

### DevDependencies in Production Builds

It's **normal and expected** for Firebase App Hosting to install devDependencies during the build phase:

- **Build phase**: Needs TypeScript, Turbo, and build tools
- **Runtime phase**: Only production code and dependencies in final container
- **NODE_ENV=production**: Optimizes build output, not dependency installation
- **Monorepo**: Requires dev tools to build workspace packages

## Best Practices

### Configuration Management
1. **Minimize overrides**: Override files should only contain environment-specific values
2. **Leverage automatic configuration**: Don't override what Firebase provides automatically
3. **Separate concerns**: Build-time vs runtime variable needs
4. **Cache optimization**: Only track variables in Turbo that should invalidate builds

### Development Workflow
1. **Keep current local setup**: Individual Firebase variables work excellently with emulators
2. **Use environment files**: `.env.development` for local, `apphosting.yaml` for production
3. **Test configuration changes**: Always verify container startup after changes
4. **Monitor build times**: Watch for cache invalidation patterns

### Debugging
1. **Check build logs**: Firebase App Hosting shows final configuration schema
2. **Inspect container spec**: Runtime environment differs from build environment  
3. **Validate turbo cache**: Use cache hit/miss patterns to identify issues
4. **Monitor startup times**: Container should start quickly without rebuilds

## Migration Notes

If migrating to `FIREBASE_WEBAPP_CONFIG` approach:
1. **Test thoroughly**: Ensure emulator compatibility isn't broken
2. **Update validation**: Remove individual Firebase variables from env validation
3. **Gradual approach**: Consider hybrid development/production configurations
4. **Document changes**: Update team on new initialization patterns

## Files Modified

- `turbo.json`: Optimized build cache tracking
- `apphosting.yaml`: Base configuration with shared settings
- `apphosting.staging.yaml`: Staging-specific overrides only
- `apphosting.prod.yaml`: Production-specific overrides only
- `apps/webapp/package.json`: Removed redundant pnpm install from build script

## Health Check / Startup Probe Configuration Limitations

### Firebase App Hosting Startup Probe Support

**❌ Critical Limitation**: Firebase App Hosting does **NOT** support configuring startup probes, liveness probes, or health checks directly in `apphosting.yaml`.

#### What's Available in `apphosting.yaml`:
- ✅ `cpu`, `memoryMiB`, `maxInstances`, `minInstances`, `concurrency` in `runConfig`
- ❌ **No health check configuration options**

#### Default Behavior:
Firebase App Hosting automatically creates **very conservative default startup probes**:
```yaml
startupProbe:
  timeoutSeconds: 240    # 4 minutes per probe
  periodSeconds: 240     # Check every 4 minutes  
  failureThreshold: 1    # Only 1 attempt
  tcpSocket:
    port: 8080
```

These defaults often cause **container startup timeouts** for applications that take more than 4 minutes to start or have any startup variability.

#### Workarounds for Custom Health Checks:

**Option 1: Manual Cloud Run Configuration** (Current approach)
1. Deploy via Firebase App Hosting
2. Manually configure startup probes in Cloud Run Console:
   - Go to [Cloud Run Console](https://console.cloud.google.com/run)
   - Edit service → Container → Health checks
   - Configure appropriate values (e.g., `initialDelaySeconds: 5`, `timeoutSeconds: 5`, `periodSeconds: 10`, `failureThreshold: 6`)

**Option 2: gcloud CLI After Each Deployment**
```bash
gcloud run services update SERVICE_NAME \
  --region=REGION \
  --startup-probe-initial-delay-seconds=5 \
  --startup-probe-timeout-seconds=5 \
  --startup-probe-period-seconds=10 \
  --startup-probe-failure-threshold=6 \
  --project=PROJECT_ID
```

**Option 3: Cloud Run Direct** (Alternative platform)
- Consider using Cloud Run directly if fine-grained health check control is critical
- Provides full health check configuration via YAML or console

#### Important Notes:
- ⚠️ **Manual configurations don't persist** through new Firebase App Hosting deployments
- ⚠️ **Must reconfigure after each deployment** to maintain custom health check settings  
- ⚠️ **No official timeline** for Firebase App Hosting to add health check configuration support

#### Recommended Health Check Values for Next.js:
Based on our testing with pre-built Next.js applications:
```yaml
startupProbe:
  initialDelaySeconds: 5    # App ready in ~4 seconds
  timeoutSeconds: 5         # Quick TCP check
  periodSeconds: 10         # Check every 10 seconds
  failureThreshold: 6       # 6 attempts = 60 seconds buffer
  tcpSocket:
    port: 8080
```

This configuration provides fast startup detection while maintaining adequate safety margins.

## Troubleshooting

### Container Startup Timeouts
- **Primary cause**: Default startup probe settings (240s timeout) are too conservative
- **Solution**: Manually configure startup probes in Cloud Run Console with appropriate values
- Check for environment variables causing cache invalidation
- Verify no redundant builds in startup scripts
- Review turbo cache hit/miss patterns in logs

### Firebase Configuration Issues
- Verify `FIREBASE_WEBAPP_CONFIG` vs individual variables consistency
- Check database selection logic for environment-specific behavior
- Validate emulator connection patterns for development

### Build Performance
- Monitor devDependency installation times (normal for monorepo)
- Check turbo cache effectiveness
- Verify build script optimization

### Health Check Related Issues
- **Symptom**: Container startup failures with "health check timeout" errors
- **Root cause**: Default 240-second startup probe settings
- **Solution**: Configure custom startup probes via Cloud Run Console
- **Prevention**: Plan to reconfigure health checks after each Firebase App Hosting deployment