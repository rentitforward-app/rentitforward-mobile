const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Support for monorepo with shared package
config.watchFolders = [
  __dirname, // Mobile app
  path.resolve(__dirname, '../rentitforward-shared'), // Shared package
];

// Resolve modules from shared package
config.resolver.nodeModulesPaths = [
  path.resolve(__dirname, 'node_modules'),
  path.resolve(__dirname, '../rentitforward-shared/node_modules'),
];

module.exports = config; 