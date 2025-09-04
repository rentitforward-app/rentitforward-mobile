# Environment Setup

## Environment Files

This project uses environment files to manage configuration across different environments.

### Required Files

Create these files in the project root (they are gitignored for security):

1. **`.env.local`** - Development environment
2. **`.env.production`** - Production environment

### Setup Instructions

1. Copy the template files:
   ```bash
   cp .env.production.template .env.production
   ```

2. Fill in the actual values in your environment files:
   - Supabase URL and keys
   - Stripe API keys (use test keys for development, live keys for production)
   - Google Maps API keys
   - Sentry DSN
   - OneSignal configuration

### Security Notes

- **NEVER** commit environment files to Git
- Use test/development keys in `.env.local`
- Use production keys only in `.env.production`
- Store production secrets securely (e.g., in CI/CD environment variables)

### EAS Build Configuration

For EAS builds, you can either:
1. Use the environment files (they'll be included in the build)
2. Set environment variables in EAS secrets:
   ```bash
   eas secret:create --scope project --name STRIPE_SECRET_KEY --value sk_live_...
   ```

### Troubleshooting

If you see "Environment variable not found" errors:
1. Ensure the environment file exists
2. Check that variable names match exactly (including EXPO_PUBLIC_ prefix)
3. Restart the development server after changing environment files
