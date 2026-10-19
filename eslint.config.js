import tseslint from 'typescript-eslint';

// Guardrail from plan 0.0.5: no stat numbers outside engine/common/config.ts.
// Scoped to src/engine (where game rules live); render/UI cosmetics are allowed literals.
export default tseslint.config(
  { ignores: ['dist', 'dist-single', 'node_modules'] },
  ...tseslint.configs.recommended,
  {
    files: ['src/engine/**/*.ts'],
    ignores: ['src/engine/common/config.ts'],
    rules: {
      'no-magic-numbers': ['error', { ignore: [0, 1, -1, 2], ignoreArrayIndexes: true, ignoreDefaultValues: true }],
    },
  },
  { rules: { '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }] } },
);
