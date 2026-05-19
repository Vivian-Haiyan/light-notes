module.exports = {
  root: true,
  env: {
    browser: true,
    es2022: true,
    node: true
  },
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    ecmaFeatures: {
      jsx: true
    }
  },
  plugins: ['react-hooks', 'react-refresh'],
  ignorePatterns: ['dist/', 'node_modules/', 'output/', '.playwright-cli/'],
  rules: {
    'react-hooks/rules-of-hooks': 'error',
    'react-refresh/only-export-components': 'off'
  }
};
