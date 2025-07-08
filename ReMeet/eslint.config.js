// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');

module.exports = defineConfig([
  expoConfig,
  {
    ignores: ['dist/*'],
  },
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true,
        },
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    rules: {
      // TypeScript rules - anyの禁止
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-any': 'off', // このルールは型情報が必要なため無効化
      '@typescript-eslint/no-unsafe-assignment': 'off', // このルールは型情報が必要なため無効化
      '@typescript-eslint/no-unsafe-call': 'off', // このルールは型情報が必要なため無効化
      '@typescript-eslint/no-unsafe-member-access': 'off', // このルールは型情報が必要なため無効化
      '@typescript-eslint/no-unsafe-return': 'off', // このルールは型情報が必要なため無効化

      // 変数宣言の制限
      'no-var': 'error', // varの使用を禁止
      'prefer-const': 'error', // 可能な限りconstを使用
      'no-let-global-reassignment': 'off', // カスタムルールなので削除

      // React Hooks rules - useEffect関連
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // useEffectの使用制限
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react'],
              importNames: ['useEffect'],
              message: 'useEffectの使用は制限されています。TanStack QueryやJotaiなどの状態管理ライブラリを使用してください。どうしても必要な場合は、依存配列を正しく設定し、クリーンアップ関数を適切に実装してください。',
            },
          ],
        },
      ],

      // 型の制限
      'no-restricted-syntax': [
        'error',
        {
          selector: 'TSUnknownKeyword',
          message: 'unknownの使用は禁止されています。適切な型を定義してください。',
        },
        {
          selector: 'VariableDeclaration[kind="let"]',
          message: 'letの使用は禁止されています。constを使用してください。',
        },
        {
          selector: 'VariableDeclaration[kind="var"]',
          message: 'varの使用は禁止されています。constを使用してください。',
        },
      ],
    },
  },
  {
    files: ['**/*.{js,jsx}'],
    plugins: {
      'react-hooks': require('eslint-plugin-react-hooks'),
    },
    rules: {
      // 変数宣言の制限
      'no-var': 'error',
      'prefer-const': 'error',

      // React Hooks rules for JS files
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // useEffectの使用制限
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['react'],
              importNames: ['useEffect'],
              message: 'useEffectの使用は制限されています。TanStack QueryやJotaiなどの状態管理ライブラリを使用してください。どうしても必要な場合は、依存配列を正しく設定し、クリーンアップ関数を適切に実装してください。',
            },
          ],
        },
      ],

      // 型の制限（JSファイルでも適用）
      'no-restricted-syntax': [
        'error',
        {
          selector: 'VariableDeclaration[kind="let"]',
          message: 'letの使用は禁止されています。constを使用してください。',
        },
        {
          selector: 'VariableDeclaration[kind="var"]',
          message: 'varの使用は禁止されています。constを使用してください。',
        },
      ],
    },
  },
  {
    // テストファイルでは一部のルールを緩和
    files: ['**/__tests__/**/*', '**/*.test.{js,jsx,ts,tsx}', '**/*.spec.{js,jsx,ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      'no-restricted-imports': 'off', // テストファイルではuseEffectの制限を解除
    },
  },
]);
