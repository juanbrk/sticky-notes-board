import js from '@eslint/js';
import prettierConfig from 'eslint-config-prettier';
import importX from 'eslint-plugin-import-x';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import perfectionist from 'eslint-plugin-perfectionist';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import unusedImports from 'eslint-plugin-unused-imports';
import globals from 'globals';
import path from 'path';
import tseslint from 'typescript-eslint';
import { fileURLToPath } from 'url';
import { defineConfig } from 'eslint/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Flat config ported from geoto-application with every rule chosen explicitly.
 * Not applicable here and therefore dropped: Tailwind, i18next, TanStack Query.
 * Rules that geoto keeps at `warn` because of legacy debt are `error` here:
 * this codebase starts with none.
 */
export default defineConfig(
  {
    ignores: ['node_modules/**', 'dist/**', 'coverage/**', 'eslint.config.js', '.claude/**'],
  },

  // Flag `eslint-disable` comments that no longer suppress anything.
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
  },

  js.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  react.configs.flat.recommended,
  react.configs.flat['jsx-runtime'],
  jsxA11y.flatConfigs.recommended,
  importX.flatConfigs.recommended,
  importX.flatConfigs.typescript,

  {
    files: ['**/*.{js,jsx,ts,tsx}'],

    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: tseslint.parser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
        projectService: true,
        tsconfigRootDir: __dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.es2025,
      },
    },

    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
      'unused-imports': unusedImports,
      perfectionist,
    },

    settings: {
      react: { version: 'detect' },
    },

    rules: {
      // ---------------------------------------------------------------- React
      'react/prop-types': 'off',
      'react/jsx-props-no-spreading': 'off',
      'react/require-default-props': 'off',
      'react/function-component-definition': 'off',
      'react/jsx-filename-extension': ['error', { extensions: ['.jsx', '.tsx'] }],
      'react/jsx-no-useless-fragment': ['error', { allowExpressions: true }],
      'react/jsx-key': 'error',
      'react/no-array-index-key': 'error',
      'react/button-has-type': 'error',

      // ----------------------------------------------------------- React Hooks
      ...reactHooks.configs['recommended-latest'].rules,
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'error',

      // Vite HMR: a module exporting more than components breaks fast refresh.
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],

      // ----------------------------------------------------------- TypeScript
      'no-use-before-define': 'off',
      '@typescript-eslint/no-use-before-define': 'off',
      'no-shadow': 'off',
      '@typescript-eslint/no-shadow': 'error',
      'no-redeclare': 'off',
      '@typescript-eslint/no-redeclare': 'error',
      'no-loop-func': 'off',
      '@typescript-eslint/no-loop-func': 'error',
      'default-param-last': 'off',
      '@typescript-eslint/default-param-last': 'error',
      'dot-notation': 'off',
      '@typescript-eslint/dot-notation': 'error',
      'no-return-await': 'off',
      '@typescript-eslint/return-await': ['error', 'in-try-catch'],
      '@typescript-eslint/consistent-type-imports': [
        'error',
        { prefer: 'type-imports', fixStyle: 'inline-type-imports' },
      ],
      '@typescript-eslint/no-unnecessary-type-assertion': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // A `default` clause counts as exhaustive; without it the rule demands every
      // union member be listed even where a deliberate catch-all exists.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true, requireDefaultForNonUnion: true },
      ],
      '@typescript-eslint/prefer-nullish-coalescing': 'error',
      '@typescript-eslint/prefer-optional-chain': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/ban-ts-comment': 'error',

      // -------------------------------------------------------- Unused symbols
      // Split so unused imports are auto-fixable; @typescript-eslint's version is
      // off to avoid double-reporting.
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'unused-imports/no-unused-imports': 'error',
      'unused-imports/no-unused-vars': [
        'error',
        {
          args: 'after-used',
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrors: 'all',
          caughtErrorsIgnorePattern: '^_',
        },
      ],

      // ------------------------------------------------------------- Imports
      'import-x/prefer-default-export': 'off',
      'import-x/no-extraneous-dependencies': ['error', { devDependencies: true }],
      'import-x/extensions': [
        'error',
        'ignorePackages',
        { pattern: { js: 'never', jsx: 'never', ts: 'never', tsx: 'never' } },
      ],
      'import-x/no-duplicates': 'error',
      // TypeScript already resolves and checks these; the ESLint-side resolver
      // only produces false positives.
      'import-x/default': 'off',
      'import-x/named': 'off',
      'import-x/namespace': 'off',
      'import-x/no-named-as-default-member': 'off',
      'import-x/no-unresolved': 'off',
      // No barrels in this project, so a cycle is always a real design problem.
      'import-x/no-cycle': 'error',
      // Ordering is owned by perfectionist below.
      'import-x/order': 'off',

      // --------------------------------------------------------- Sorting
      'perfectionist/sort-imports': [
        'error',
        {
          type: 'alphabetical',
          order: 'asc',
          ignoreCase: true,
          newlinesBetween: 1,
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index'], 'unknown'],
        },
      ],
      'perfectionist/sort-named-imports': ['error', { type: 'alphabetical', ignoreCase: true }],

      // ---------------------------------------------------- General correctness
      'no-param-reassign': ['error', { props: true }],
      'no-void': ['error', { allowAsStatement: true }],
      eqeqeq: ['error', 'always', { null: 'ignore' }],
      'no-console': ['warn', { allow: ['warn', 'error'] }],
      // Project rule: no barrel files. Import the module that defines the thing.
      'no-restricted-syntax': [
        'error',
        {
          selector: 'ExportAllDeclaration',
          message: 'No barrel files: import from the defining module (see conventions/types.md).',
        },
      ],

      // ------------------------------------------------------- Accessibility
      'jsx-a11y/click-events-have-key-events': 'error',
      'jsx-a11y/no-static-element-interactions': 'error',
      'jsx-a11y/alt-text': 'error',
      'jsx-a11y/label-has-associated-control': 'error',
      'jsx-a11y/no-noninteractive-element-interactions': 'error',
    },
  },

  // Root-level JS config files sit outside the TypeScript program because
  // tsconfig.json sets `allowJs: false`. Lint them without type-aware rules.
  {
    files: ['**/*.{js,cjs,mjs}'],
    ...tseslint.configs.disableTypeChecked,
    languageOptions: {
      globals: { ...globals.node },
      parserOptions: { projectService: false, project: null },
    },
  },

  // Must stay last: turns off everything Prettier owns.
  prettierConfig
);
