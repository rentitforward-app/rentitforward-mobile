module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@': './src',
            '@/components': './src/components',
            '@/screens': './src/screens',
            '@/hooks': './src/hooks',
            '@/utils': './src/utils',
            '@/types': './src/types',
            '@/constants': './src/constants',
            '@rentitforward/shared': './shared-dist',
            '@shared': './shared-dist',
          },
        },
      ],
      // 'nativewind/babel', // Temporarily disabled
      'react-native-reanimated/plugin',
    ],
  };
}; 