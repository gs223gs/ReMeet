module.exports = {
  preset: 'jest-expo',
  transformIgnorePatterns: [
    'node_modules/(?!((jest-)?react-native|@react-native(-community)?)|expo(nent)?|@expo(nent)?/.*|@expo-google-fonts/.*|react-navigation|@react-navigation/.*|@sentry/.*|native-base|react-native-svg)'
  ],
  collectCoverage: true,
  collectCoverageFrom: [
    '**/*.{ts,tsx,js,jsx}',
    '!**/coverage/**',
    '!**/node_modules/**',
    '!**/babel.config.js',
    '!**/expo-env.d.ts',
    '!**/.expo/**',
    '!**/dist/**',
    '!**/scripts/**',
    '!**/jest.config.js',
    '!**/jest.setup.js',
    '!**/eslint.config.js',
    '!**/metro.config.js',
    '!**/components/ui/SwipeableCardList.tsx',
    '!**/components/ui/SwipeablePersonCard.tsx',
    '!**/components/ui/SwipeableCard.tsx',
    '!**/components/ui/IconSymbol*.tsx',
    '!**/components/ui/TabBarBackground*.tsx',
    '!**/components/forms/TagChip.tsx',
    '!**/components/HapticTab.tsx',
    '!**/database/sqlite-types.ts',
    '!**/hooks/useColorScheme.web.ts',
    '!**/database/sqlite-services/index.ts',
    '!**/app/+not-found.tsx',
    '!**/app/_layout.tsx',
    '!**/app/person-edit.tsx',
    '!**/app/person-register.tsx',
    '!**/app/register.tsx',
    '!**/app/(tabs)/_layout.tsx',
    '!**/app/(tabs)/explore.tsx',
    '!**/app/(tabs)/index.tsx'
  ],
  coverageThreshold: {
    global: {
      statements: 60,
      branches: 50,
      functions: 60,
      lines: 60
    }
  },
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@react-native-async-storage/async-storage$': '<rootDir>/__mocks__/@react-native-async-storage/async-storage.js'
  }
};