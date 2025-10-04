// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      sourceType: 'commonjs',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // -----------------------------------------------------------
      // 1. DISABLE UNUSED VARS (for all files)
      // The base ESLint rule is disabled because the TS version is better.
      'no-unused-vars': 'off',
      // The TypeScript rule is set to 'off' to disable warnings completely.
      // NOTE: 'varsIgnorePattern' can be used instead to ignore specific names like 'req' or '_'
      '@typescript-eslint/no-unused-vars': 'off',
      
      // -----------------------------------------------------------
      // 2. DISABLE PRETTIER WARNINGS
      // The 'prettier/prettier' rule is what generates the warnings when Prettier finds a formatting issue.
      // Setting it to 'off' effectively disables formatting warnings.
      'prettier/prettier': 'off',

      // -----------------------------------------------------------
      // 3. CLEAN UP AND APPLY EXISTING/DESIRED RULES
      //
      // Remove broken or non-existent rules:
      // '@typescript-eslint/disable prettier/prettier':'off', <--- Incorrect rule name
      // '@typescript-esling/no-unused-vars': 'off', <--- Typo in rule name
      
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      '@typescript-eslint/no-unsafe-member-access': 'off', 
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off', 
      '@typescript-eslint/no-unsafe-enum-comparison': 'off',
    },
  },
);