import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import stylisticTs from '@stylistic/eslint-plugin-ts'

export default tseslint.config({
  files: ['**/*.ts'],
  plugins: {
    '@typescript-eslint': tseslint.plugin,
    '@stylistic/ts': stylisticTs
  },
  // languageOptions: {
  //   parserOptions: {
  //     parser: tseslint.parser,
  //     project: true,
  //   },
  // },
  extends: [
    stylisticTs.configs['all-flat'],
    eslint.configs.recommended,
    ...tseslint.configs.recommended,
  ],
  rules: {
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/consistent-type-imports': 'error',
    '@typescript-eslint/adjacent-overload-signatures': 'error',
    '@typescript-eslint/array-type': 'error',
    '@typescript-eslint/consistent-generic-constructors': 'error',
    '@typescript-eslint/method-signature-style': 'error',

    '@stylistic/ts/space-before-function-paren': ['error', {
      "anonymous": "always",
      "named": "never",
      "asyncArrow": "always"
    }],

    '@stylistic/ts/comma-dangle': ['error', 'always-multiline'],
    '@stylistic/ts/indent': ["error", "tab"],
    '@stylistic/ts/object-curly-spacing': ['error', 'always'],
    '@stylistic/ts/quote-props': ['error', 'as-needed'],
    '@stylistic/ts/semi': ['error', 'always'],

    '@stylistic/ts/quotes': "off",
  },
});
