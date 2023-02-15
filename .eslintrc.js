/* eslint-disable max-lines */
module.exports = {
  root: true,
  ignorePatterns: ['**/node_modules/**', '**/dist/**'],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 6,
    sourceType: 'module',
  },
  env: {
    es6: true,
    browser: true,
    node: true,
  },
  settings: {
    'import/resolver': {
      typescript: {
        project: '**/tsconfig.json',
      },
    },
    'import/extensions': [
      '.js',
      '.jsx',
      '.ts',
      '.d.ts',
      '.tsx',
      '.mjs',
      '.cjs',
    ],
    react: {
      version: '17.0',
    },
  },
  plugins: [
    'prettier',
    'react',
    'react-hooks',
    'import',
    'filenames',
    'promise',
    'eslint-comments',
  ],
  extends: [
    // https://eslint.org/docs/user-guide/configuring#using-eslintrecommended
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:import/errors',
    'plugin:import/warnings',
    'plugin:eslint-comments/recommended',
    'plugin:promise/recommended',
  ],
  rules: {
    'prettier/prettier': [
      'error',
      {
        printWidth: 80,
        tabWidth: 2,
        useTabs: false,
        semi: true,
        singleQuote: true,
        trailingComma: 'all',
        bracketSpacing: true,
        bracketSameLine: true,
        arrowParens: 'avoid',
        endOfLine: 'auto',
      },
    ],
    'react/prop-types': 'off',
    'array-bracket-spacing': ['error', 'never'],
    'no-debugger': 'error',
    'no-dupe-args': 'error',
    'no-dupe-keys': 'error',
    'no-duplicate-case': 'error',
    'no-console': ['error', { allow: ['info', 'warn', 'error'] }],
    'no-async-promise-executor': 'error',
    // https://eslint.org/docs/rules/no-constant-condition
    'no-constant-condition': ['error', { checkLoops: false }],
    'no-empty-function': 'off',
    // https://eslint.org/docs/rules/no-self-assign
    'no-self-assign': ['error', { props: true }],
    // https://eslint.org/docs/rules/no-self-compare
    'no-self-compare': 'error',
    // https://eslint.org/docs/rules/no-sequences
    // @BUG conflict with prettier
    'no-sequences': 'off',
    // 'no-sequences': 'error',
    // https://eslint.org/docs/rules/no-throw-literal
    'no-throw-literal': 'error',
    // https://eslint.org/docs/rules/no-unmodified-loop-condition
    'no-unmodified-loop-condition': 'error',
    // https://eslint.org/docs/rules/no-unused-expressions
    'no-unused-expressions': 'off',
    // https://eslint.org/docs/rules/no-unused-labels
    'no-unused-labels': 'error',
    // https://eslint.org/docs/rules/no-useless-call
    'no-useless-call': 'error',
    // https://eslint.org/docs/rules/no-useless-catch
    'no-useless-catch': 'error',
    // https://eslint.org/docs/rules/no-useless-concat
    'no-useless-concat': 'error',
    // https://eslint.org/docs/rules/no-useless-escape
    'no-useless-escape': 'error',
    // https://eslint.org/docs/rules/no-useless-return
    'no-useless-return': 'error',
    'no-undef': 'error',
    'no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'after-used',
        ignoreRestSiblings: true,
        argsIgnorePattern: '^_',
        caughtErrors: 'none',
      },
    ],
    'no-use-before-define': [
      'error',
      {
        functions: false,
        classes: false,
        variables: false,
      },
    ],
    // https://eslint.org/docs/rules/key-spacing
    'key-spacing': [
      'error',
      {
        beforeColon: false,
        afterColon: true,
        mode: 'strict',
      },
    ],
    // https://eslint.org/docs/rules/keyword-spacing
    'keyword-spacing': [
      'error',
      {
        before: true,
        after: true,
      },
    ],
    quotes: [
      'error',
      'single',
      { avoidEscape: true, allowTemplateLiterals: true },
    ],
    'comma-dangle': [
      'error',
      {
        imports: 'only-multiline',
        objects: 'only-multiline',
        arrays: 'only-multiline',
        functions: 'ignore',
        exports: 'ignore',
      },
    ],
    curly: 'warn',
    eqeqeq: 'warn',
    semi: ['error', 'always'],
    'import/order': [
      'error',
      {
        groups: [
          'builtin',
          'external',
          'internal',
          'index',
          'sibling',
          'parent',
          'unknown',
          'type',
          'object',
        ],
      },
    ],
    'brace-style': ['error', '1tbs', { allowSingleLine: true }],
    'max-depth': ['warn', 4],
    'max-len': [
      'error',
      {
        code: 80,
        tabWidth: 4,
        ignoreComments: true,
        ignoreTrailingComments: false,
        ignoreUrls: true,
        ignoreStrings: true,
        ignoreTemplateLiterals: true,
        ignoreRegExpLiterals: true,
      },
    ],
    'max-lines': [
      'warn',
      {
        max: 300,
        skipBlankLines: true,
        skipComments: true,
      },
    ],
    'max-nested-callbacks': ['warn', 4],
    // https://eslint.org/docs/rules/max-params
    'max-params': ['warn', 4],
    // https://eslint.org/docs/rules/max-statements
    'max-statements': ['warn', 20],
    // https://eslint.org/docs/rules/max-statements-per-line
    'max-statements-per-line': ['error', { max: 1 }],
    'import/first': 'error',
    'import/no-duplicates': 'error',
    'import/no-named-default': 'error',
    'import/no-webpack-loader-syntax': 'error',
    'import/no-unresolved': [
      'error',
      {
        caseSensitive: true,
        ignore: [
          '\\.(scss|sass|less|styl|stylus|pcss|css)$',
          '\\.(jpg|jpeg|jfif|pjpeg|pjp|png|gif|svg|ico|webp|avif|mp4|webm|ogg|mp3|wav|flac|aac)$',
          '\\.(woff|woff2|eot|ttf|otf|)$',
          '\\.(pdf|txt)$',
        ],
      },
    ],
    'filenames/match-exported': ['error', ['kebab', 'camel', 'pascal']],
  },
  overrides: [
    {
      files: ['*.ts', '*.d.ts', '*.tsx'],
      plugins: ['@typescript-eslint'],
      settings: {
        'import/external-module-folders': [
          'node_modules',
          'node_modules/@types',
        ],
        'import/parsers': {
          '@typescript-eslint/parser': ['.ts', '.tsx', '.d.ts'],
        },
      },
      rules: {
        '@typescript-eslint/ban-ts-comment': [
          'error',
          { 'ts-ignore': 'allow-with-description' },
        ],
        '@typescript-eslint/member-delimiter-style': [
          'error',
          {
            multiline: {
              delimiter: 'semi',
              requireLast: true,
            },
            singleline: {
              delimiter: 'semi',
              requireLast: false,
            },
          },
        ],
        '@typescript-eslint/type-annotation-spacing': ['error', {}],
        '@typescript-eslint/consistent-type-imports': [
          'error',
          { prefer: 'type-imports', disallowTypeAnnotations: true },
        ],
        '@typescript-eslint/consistent-type-definitions': 'off',
        '@typescript-eslint/prefer-ts-expect-error': 'error',

        // Override JS
        'no-useless-constructor': 'off',
        'no-unused-vars': 'off',
        '@typescript-eslint/no-unused-vars': [
          'error',
          { argsIgnorePattern: '^_' },
        ],
        'no-redeclare': 'off',
        '@typescript-eslint/no-redeclare': 'error',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': [
          'error',
          { functions: false, classes: false, variables: true },
        ],
        'brace-style': 'off',
        '@typescript-eslint/brace-style': [
          'error',
          '1tbs',
          { allowSingleLine: true },
        ],
        'comma-dangle': 'off',
        '@typescript-eslint/comma-dangle': ['error', 'always-multiline'],
        'object-curly-spacing': 'off',
        '@typescript-eslint/object-curly-spacing': ['error', 'always'],
        semi: 'off',
        '@typescript-eslint/semi': ['error', 'always'],
        quotes: 'off',
        '@typescript-eslint/quotes': ['error', 'single'],
        'space-before-blocks': 'off',
        '@typescript-eslint/space-before-blocks': ['error', 'always'],
        'space-before-function-paren': 'off',
        '@typescript-eslint/space-before-function-paren': [
          'error',
          {
            anonymous: 'always',
            named: 'never',
            asyncArrow: 'always',
          },
        ],
        'space-infix-ops': 'off',
        '@typescript-eslint/space-infix-ops': 'error',
        'keyword-spacing': 'off',
        '@typescript-eslint/keyword-spacing': [
          'error',
          { before: true, after: true },
        ],
        'comma-spacing': 'off',
        '@typescript-eslint/comma-spacing': [
          'error',
          { before: false, after: true },
        ],
        'no-extra-parens': 'off',
        '@typescript-eslint/no-extra-parens': ['error', 'functions'],
        'no-dupe-class-members': 'off',
        '@typescript-eslint/no-dupe-class-members': 'error',
        'no-loss-of-precision': 'off',
        '@typescript-eslint/no-loss-of-precision': 'error',
        'lines-between-class-members': 'off',
        '@typescript-eslint/lines-between-class-members': [
          'error',
          'always',
          { exceptAfterSingleLine: true },
        ],
        // off
        '@typescript-eslint/consistent-indexed-object-style': 'off',
        '@typescript-eslint/naming-convention': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-member-accessibility': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/parameter-properties': 'off',
        '@typescript-eslint/no-empty-interface': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/no-empty-function': 'off',
        '@typescript-eslint/no-non-null-assertion': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/ban-types': 'off',
        '@typescript-eslint/no-namespace': 'off',
        '@typescript-eslint/triple-slash-reference': 'off',
      },
    },
    {
      files: [
        '**/*/src/pages/**/*.ts',
        '**/*/src/pages/**/*.js',
        '**/*/src/pages/**/*.tsx',
        '**/*/src/pages/**/*.jsx',
      ],
      rules: {
        'filenames/match-exported': 'off',
      },
    },
  ],
};
/* eslint-enable max-lines */
