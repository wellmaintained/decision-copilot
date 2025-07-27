#!/bin/bash
set -e

echo "🔧 Firebase App Hosting Custom Build Script for Monorepo"
echo "Working directory: $(pwd)"
echo "Contents: $(ls -la)"

# Check if we're in the webapp directory or root
if [ -f "package.json" ] && grep -q '"name": "webapp"' package.json; then
    echo "✅ Already in webapp directory"
    WEBAPP_DIR="."
    ROOT_DIR="../.."
elif [ -f "apps/webapp/package.json" ]; then
    echo "✅ In monorepo root, webapp found at apps/webapp"
    WEBAPP_DIR="apps/webapp"
    ROOT_DIR="."
else
    echo "❌ Cannot find webapp directory structure"
    exit 1
fi

echo "📦 Installing dependencies from monorepo root..."
cd "$ROOT_DIR"
if [ ! -f "pnpm-lock.yaml" ]; then
    echo "❌ pnpm-lock.yaml not found in root"
    exit 1
fi

# Install dependencies using pnpm
pnpm install --frozen-lockfile

echo "🏗️ Building webapp..."
cd "$WEBAPP_DIR"
npm run build:profile

echo "✅ Build completed successfully"