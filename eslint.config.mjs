import nextVitals from 'eslint-config-next/core-web-vitals';
import nextTs from 'eslint-config-next/typescript';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

const config = [
  ...nextVitals,
  ...nextTs,
  prettier,
  {
    ignores: [
      '.next/**',
      'out/**',
      'node_modules/**',
      'legacy/**',
      '.agents/**',
      'next-env.d.ts',
      'output/**',
      '.venv-chatterbox/**',
      '.venv-tts/**',
    ],
  },
  {
    // Canvas engine: plain ES modules, no React.
    files: ['src/game/**/*.js'],
    languageOptions: { globals: { ...globals.browser } },
    rules: {
      'no-undef': 'error',
      'no-import-assign': 'error',
      'no-unused-vars': ['warn', { args: 'none', caughtErrors: 'none' }],
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-unused-expressions': 'off',
      '@typescript-eslint/no-this-alias': 'off',
    },
  },
  {
    files: ['tests/**/*.js', 'tools/**/*.js'],
    languageOptions: { globals: { ...globals.node } },
    rules: { '@typescript-eslint/no-unused-expressions': 'off' },
  },
];

export default config;
