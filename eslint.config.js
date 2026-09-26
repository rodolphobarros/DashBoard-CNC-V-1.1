import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  js.configs.recommended,

  // ============================================
  // BACKEND — server-side code (Node.js)
  // ============================================
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
  },

  // ============================================
  // FRONTEND — browser-side code
  // ============================================
  {
    files: ['public/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        io: 'readonly',
      },
    },
  },

  // ============================================
  // IGNORED DIRECTORIES
  // ============================================
  {
    ignores: ['node_modules/**', 'logs/**'],
  },

  // Must be last — disables rules that conflict with Prettier
  eslintConfigPrettier,
];
