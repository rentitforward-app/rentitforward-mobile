#!/bin/bash

# Rent It Forward - Monorepo Migration Script
echo "🚀 Starting Rent It Forward monorepo migration..."

# Create new monorepo structure
echo "📁 Creating monorepo structure..."
mkdir -p rentitforward-monorepo/{apps/{web,mobile},packages/shared}

# Copy existing repositories
echo "📋 Copying web app..."
cp -r rentitforward-web/* rentitforward-monorepo/apps/web/
rm -rf rentitforward-monorepo/apps/web/node_modules
rm -rf rentitforward-monorepo/apps/web/.next

echo "📋 Copying mobile app..."
cp -r rentitforward-mobile/* rentitforward-monorepo/apps/mobile/
rm -rf rentitforward-monorepo/apps/mobile/node_modules
rm -rf rentitforward-monorepo/apps/mobile/.expo

echo "📋 Copying shared package..."
cp -r rentitforward-shared/* rentitforward-monorepo/packages/shared/
rm -rf rentitforward-monorepo/packages/shared/node_modules
rm -rf rentitforward-monorepo/packages/shared/dist

# Create root package.json
echo "📦 Creating root package.json..."
cat > rentitforward-monorepo/package.json << 'EOF'
{
  "name": "rentitforward",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "apps/*",
    "packages/*"
  ],
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev --parallel",
    "dev:web": "turbo run dev --filter=@rentitforward/web",
    "dev:mobile": "turbo run dev --filter=@rentitforward/mobile",
    "lint": "turbo run lint",
    "type-check": "turbo run type-check",
    "clean": "turbo run clean",
    "build:shared": "turbo run build --filter=@rentitforward/shared"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  },
  "packageManager": "npm@10.0.0"
}
EOF

# Create turbo.json
echo "⚡ Creating turbo configuration..."
cat > rentitforward-monorepo/turbo.json << 'EOF'
{
  "tasks": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "build/**", "expo-build/**"]
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "lint": {
      "dependsOn": ["^build"]
    },
    "type-check": {
      "dependsOn": ["^build"]
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Update package.json files
echo "🔧 Updating package.json files..."

# Update web package.json
cd rentitforward-monorepo/apps/web
npm pkg set name="@rentitforward/web"
npm pkg set dependencies.@rentitforward/shared="workspace:*"
cd ../../..

# Update mobile package.json  
cd rentitforward-monorepo/apps/mobile
npm pkg set name="@rentitforward/mobile"
npm pkg set dependencies.@rentitforward/shared="workspace:*"
cd ../../..

# Update shared package.json
cd rentitforward-monorepo/packages/shared
npm pkg set name="@rentitforward/shared"
cd ../../..

# Create root README
echo "📖 Creating root README..."
cat > rentitforward-monorepo/README.md << 'EOF'
# Rent It Forward - Monorepo

A peer-to-peer rental marketplace built with modern web and mobile technologies.

## 🏗️ Architecture

- **Web App** (`apps/web`): Next.js 15 + Tailwind CSS
- **Mobile App** (`apps/mobile`): Expo + React Native + NativeWind  
- **Shared Package** (`packages/shared`): TypeScript types, utilities, design system

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start all apps in development
npm run dev

# Start individual apps
npm run dev:web     # Web app only
npm run dev:mobile  # Mobile app only

# Build all packages
npm run build

# Type check all packages
npm run type-check
```

## 📱 Development

### Web App
```bash
cd apps/web
npm run dev
```

### Mobile App
```bash
cd apps/mobile
npm run start
```

### Shared Package
```bash
cd packages/shared
npm run dev    # Watch mode
npm run build  # Build once
```

## 🎯 Tech Stack

- **Frontend**: React 19, Next.js 15, Expo SDK 51
- **Styling**: Tailwind CSS, NativeWind
- **Backend**: Supabase (PostgreSQL + Auth + Storage)
- **Payments**: Stripe Connect
- **State**: Zustand + TanStack Query
- **Validation**: Zod + React Hook Form
- **Monorepo**: Turbo
- **Language**: TypeScript

## 🚀 Deployment

The monorepo is set up for easy deployment:
- Web app: Vercel/Netlify
- Mobile app: EAS Build
- Shared package: Auto-built during deployments
EOF

echo "✅ Migration complete!"
echo ""
echo "🎯 Next steps:"
echo "1. cd rentitforward-monorepo"
echo "2. npm install"
echo "3. npm run build:shared"
echo "4. npm run dev"
echo ""
echo "🚀 Your monorepo is ready!" 