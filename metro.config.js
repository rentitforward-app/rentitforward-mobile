const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve shared package from a vendored dist inside mobile repo to ensure EAS packs it
config.resolver.alias = {
  '@rentitforward/shared': path.resolve(__dirname, './shared-dist'),
  '@shared': path.resolve(__dirname, './shared-dist'),
  // Shim server-only stripe SDK to avoid bundling errors in RN
  stripe: path.resolve(__dirname, './src/shims/stripe-empty.js'),
  crypto: 'react-native-crypto',
};

// Prefer react-native entry points
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;