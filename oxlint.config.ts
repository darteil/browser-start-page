import { defineConfig } from 'oxlint';

export default defineConfig({
  plugins: ['eslint', 'oxc', 'unicorn'],
  env: {
    browser: true,
    es2021: true,
  },
  categories: {
    correctness: 'warn',
  },
  rules: {
    'no-unused-vars': 'off',
    'eslint/no-unused-vars': 'off',
  },
});
