import js from '@eslint/js';
import globals from 'globals';
import eslintConfigPrettier from 'eslint-config-prettier';

export default [
  // ==========================================================
  // Arquivos ignorados
  // ==========================================================
  {
    ignores: [
      'node_modules/**',
      'coverage/**',
      'dist/**',
      'build/**',
      'logs/**',
      '.cache/**',
    ],
  },

  // ==========================================================
  // Regras recomendadas
  // ==========================================================
  js.configs.recommended,

  // ==========================================================
  // Backend - Node.js
  // ==========================================================
  {
    files: ['src/**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },

    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },

  // ==========================================================
  // Frontend - Browser
  // ==========================================================
  {
    files: ['public/**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.browser,
      },
    },

    rules: {
      'no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      'no-console': 'off',
    },
  },

  // ==========================================================
  // Testes
  // ==========================================================
  {
    files: ['test/**/*.js', 'tests/**/*.js'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',

      globals: {
        ...globals.node,
      },
    },
  },

  // ==========================================================
  // Evitar conflitos ESLint x Prettier
  // Deve permanecer no final
  // ==========================================================
  eslintConfigPrettier,
];
