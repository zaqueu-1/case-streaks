import nextEslint from 'next/eslint';

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  ...nextEslint.configs.recommended,
];
