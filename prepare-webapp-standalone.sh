#!/bin/bash
set -e

echo "🔧 Preparing webapp as standalone project for Firebase App Hosting..."

# Build all packages first
echo "📦 Building all workspace packages..."
pnpm run build

# Create a temporary directory for the standalone webapp
TEMP_DIR=$(mktemp -d)
echo "📁 Using temporary directory: $TEMP_DIR"

# Copy webapp source
echo "📋 Copying webapp source..."
cp -r apps/webapp/* "$TEMP_DIR/"

# Create node_modules/@decision-copilot in the temp directory
mkdir -p "$TEMP_DIR/node_modules/@decision-copilot"

# Copy built packages to node_modules
echo "📦 Copying built workspace packages..."
for pkg in domain infrastructure ui; do
    echo "  - Copying $pkg..."
    cp -r "packages/$pkg" "$TEMP_DIR/node_modules/@decision-copilot/"
done

# Update package.json to use installed versions instead of file: paths
echo "🔧 Updating package.json dependencies..."
cd "$TEMP_DIR"

# Read package versions from workspace packages
DOMAIN_VERSION=$(node -p "require('./node_modules/@decision-copilot/domain/package.json').version")
INFRA_VERSION=$(node -p "require('./node_modules/@decision-copilot/infrastructure/package.json').version")
UI_VERSION=$(node -p "require('./node_modules/@decision-copilot/ui/package.json').version")

# Update package.json with version numbers instead of file: paths
sed -i.bak "s|\"@decision-copilot/domain\": \"file:../../packages/domain\"|\"@decision-copilot/domain\": \"$DOMAIN_VERSION\"|g" package.json
sed -i.bak "s|\"@decision-copilot/infrastructure\": \"file:../../packages/infrastructure\"|\"@decision-copilot/infrastructure\": \"$INFRA_VERSION\"|g" package.json
sed -i.bak "s|\"@decision-copilot/ui\": \"file:../../packages/ui\"|\"@decision-copilot/ui\": \"$UI_VERSION\"|g" package.json

# Generate new lockfile for this standalone setup
echo "🔒 Generating new lockfile..."
pnpm install

# Copy the prepared files back to the webapp directory
echo "📋 Copying prepared files back..."
cp package.json "../apps/webapp/"
cp pnpm-lock.yaml "../apps/webapp/"

# Cleanup
echo "🧹 Cleaning up..."
rm -rf "$TEMP_DIR"

echo "✅ Webapp prepared as standalone project!"
echo "📝 Files updated:"
echo "  - apps/webapp/package.json (with version-based dependencies)"
echo "  - apps/webapp/pnpm-lock.yaml (regenerated for standalone setup)"