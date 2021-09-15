module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'airbnb-base',
    'airbnb-typescript/base',
    'plugin:jest/recommended',
    'plugin:jest/style',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    // Default NestJS rules
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    // Custom additions
    'linebreak-style': 'off',
    'arrow-body-style': 'off',
    'max-len': ['warn', { 'code': 140 }],
    'no-unused-vars': 'warn',
    '@typescript-eslint/no-unused-vars': 'warn',
    'func-names': 'off',
    'object-shorthand': ['error', 'properties'],
    '@typescript-eslint/lines-between-class-members': 'off',
    'no-underscore-dangle': 'off',
    'no-plusplus': ['error', { 'allowForLoopAfterthoughts': true }],
    'no-param-reassign': ['error', { 'props': false }],
    'jest/expect-expect': ['error', { 'assertFunctionNames': ['expect', 'request.**.expect'] }],
    // NestJS examples really seem to like named exports everywhere, so we'll disable the prefer-default-export rule
    'import/prefer-default-export': 'off'
  }
};
