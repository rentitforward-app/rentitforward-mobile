const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Add monorepo support for shared package
config.watchFolders = [
  path.resolve(__dirname, '../rentitforward-shared'),
];

config.resolver.alias = {
  '@rentitforward/shared': path.resolve(__dirname, '../rentitforward-shared/src'),
  '@shared': path.resolve(__dirname, '../rentitforward-shared/src'),
  crypto: 'react-native-crypto',
};

// Add Node.js polyfills for React Native
config.resolver.resolverMainFields = ['react-native', 'browser', 'main'];

module.exports = config;