/* eslint-env node */
module.exports = {
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint'],
  overrides: [
    // Typescript
    {
      files: ['*.ts'],

      extends: [
        'eslint:recommended',
        // 'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/recommended-type-checked',
        'plugin:@typescript-eslint/stylistic-type-checked',
      ],

      parserOptions: {
        project: ['./tsconfig.json'],
      },
      rules: {
        '@typescript-eslint/no-misused-promises': 'off',
        '@typescript-eslint/no-unsafe-assignment': 'off',
        '@typescript-eslint/no-unsafe-member-access': 'off',
        '@typescript-eslint/no-unsafe-argument': 'off',
        '@typescript-eslint/no-unsafe-return': 'off',
        '@typescript-eslint/no-unsafe-call': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-unnecessary-type-assertion': 'off',
        '@typescript-eslint/prefer-for-of': 'off',
        '@typescript-eslint/no-floating-promises': 'off',
        '@typescript-eslint/require-await': 'off',
        'no-empty': 'off',
      },
    },
    {
      files: ['*.svelte'],

      extends: [
        // 'eslint:recommended',
        'plugin:svelte/recommended',
      ],
    },
  ],
  root: true,
};

/* module.exports = {
  env: {
    'browser': true,
    'es2021': true,
  },
  extends: [],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    'ecmaVersion': 'latest',
    'sourceType': 'module',
    'project': ['./tsconfig.json'],
  },
  plugins: [
    '@typescript-eslint',
  ],
  ignorePatterns: [
    '.svelte-kit/**',
  ],
  overrides: [{
    files: ['*.ts'],

    parserOptions: {
      project: ['./tsconfig.json'],
    },
  }],
  rules: {
    // 'max-len': 'off',
    'keyword-spacing': ['error', {
      after: true,
      overrides: {
        if: { before: true, after: true },
        else: { before: true },
        catch: { before: true, after: true },
        for: { after: true },
        while: { after: true },
        switch: { after: true }
      }
    }],
    'linebreak-style': ['error', 'unix'],
    'eol-last': 'error',
    'indent': [
      'error', 2, {
        'CallExpression': {
          'arguments': 1
        },
        'FunctionDeclaration': {
          'body': 1,
          'parameters': 1
        },
        'FunctionExpression': {
          'body': 1,
          'parameters': 1
        },
        'MemberExpression': 0,
        'ObjectExpression': 1,
        'SwitchCase': 1,
        'ignoredNodes': [
          'ConditionalExpression'
        ]
      }
    ],
    // 'valid-jsdoc': 'off',
    // 'require-jsdoc': 'off',
    // 'camelcase': 'off',
    'space-before-function-paren': ['error', 'always'],
    // 'guard-for-in': 'off',
    // 'prefer-promise-reject-errors': ['error', {allowEmptyReject: true}],
    'prefer-promise-reject-errors': 'off',
    'curly': 'off',
    'comma-dangle': ['error', 'never'],
    'comma-spacing': 'error',
    'comma-style': 'error',
    'quote-props': ['error', 'consistent'],
    'quotes': ['error', 'single', { allowTemplateLiterals: true }],
    'space-before-blocks': ['error', 'always'],
    'spaced-comment': ['error', 'always'],
    'prefer-spread': 'off',
    'prefer-const': ['error', { destructuring: 'all' }],
    'object-curly-spacing': ['error', 'never'],
    'array-bracket-spacing': ['error', 'never'],
    'switch-colon-spacing': 'error',
    'operator-linebreak': ['error', 'after'],
    'padded-blocks': ['error', 'never'],
    // 'new-cap': 'error',
    // 'no-unused-vars': 'off',
    'no-useless-call': 'error',
    'no-trailing-spaces': 'error',
    'no-mixed-spaces-and-tabs': 'error',
    'no-multiple-empty-lines': ['error', { max: 2 }],
    'no-tabs': 'error',
    // 'no-multi-spaces': 'error',
    'no-multi-str': 'error',
    'no-new-wrappers': 'error',
    'no-irregular-whitespace': ['error', { skipStrings: true, skipComments: true, skipRegExps: true, skipTemplates: true }],
    'no-unexpected-multiline': 'error',
    'no-return-await': 'error',
    '@typescript-eslint/await-thenable': 'error',
    // '@typescript-eslint/no-misused-promises': 'error'
    // '@typescript-eslint/no-misused-promises': ['error', {checksConditionals: true, checksVoidReturn: true, checksSpreads: true}]
  }
}; */

