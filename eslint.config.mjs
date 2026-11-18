// Lint configuration (Flat Config, ESLint 10).
//
// The TypeScript rules come from `@iqb/eslint-config/compat`: the effective rules of
// `@iqb/eslint-config` 2.2.0 under their current names, formatting in `@stylistic` and imports in
// `import-x`. Its default export is a different rule set and not used here. What follows are this
// repository's own additions to that set (#1704).
import globals from 'globals';
import javascript from '@iqb/eslint-config/javascript';
import compat from '@iqb/eslint-config/compat';

const typescriptFiles = ['**/*.{ts,tsx,mts,cts}'];

/** The shared set's `no-restricted-syntax` entries, severity first; the spec override adds to them. */
const sharedRestrictedSyntax = compat
  .find(config => config.rules?.['no-restricted-syntax'])
  .rules['no-restricted-syntax'];

export default [
  {
    ignores: [
      '**/assets/**',
      '**/coverage/**',
      '**/dist/**',
      '**/scripts/**',
      '**/test-data/**',
      // ESLint 8 skipped dot-directories by itself; Flat Config does not (.angular/cache holds
      // build output).
      '**/.*/**'
    ]
  },
  ...javascript,
  ...compat,
  {
    files: typescriptFiles,
    languageOptions: {
      parserOptions: {
        // One program from tsconfig.json, as before. The project service would pick each file's
        // nearest tsconfig instead, which can change what the type-aware rules report.
        projectService: false,
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname
      }
    },
    rules: {
      // `/compat` starts from 2.2.0 with typescript-eslint 7, this repository came from 2.1.1 with
      // typescript-eslint 5. These four checks were part of it and stay on.
      '@typescript-eslint/no-non-null-assertion': 'warn',
      '@typescript-eslint/adjacent-overload-signatures': 'error',
      '@typescript-eslint/prefer-namespace-keyword': 'error',
      '@typescript-eslint/no-empty-object-type': 'error', // successor of no-empty-interface

      '@stylistic/function-call-argument-newline': 'off',
      '@stylistic/indent': [
        'error',
        2,
        {
          SwitchCase: 1,
          FunctionDeclaration: { parameters: 'first' },
          FunctionExpression: { parameters: 'first' },
          CallExpression: { arguments: 'first' }
        }
      ],
      'class-methods-use-this': [
        'error',
        {
          exceptMethods: ['getElementComponent', 'getNewOptionLabel', 'getTranslation', 'transform']
        }
      ],
      'no-console': ['error', { allow: ['warn', 'error'] }]
    }
  },
  {
    files: ['e2e/**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-expressions': ['error', { allowTaggedTemplates: true }],
      '@stylistic/newline-per-chained-call': 'off'
    }
  },
  {
    // The shared restrictions, plus an existence test beside other tests (rules.md §11).
    files: ['projects/**/*.spec.ts'],
    rules: {
      /* eslint-disable @stylistic/max-len -- selectors and messages are kept on one line each */
      'no-restricted-syntax': [
        ...sharedRestrictedSyntax,
        {
          selector: ":matches(Program, BlockStatement):has(CallExpression:matches([callee.name=/^(it|test)$/], [callee.object.name=/^(it|test)$/][callee.property.name=/^(only|fails|concurrent)$/], [callee.callee.object.name=/^(it|test)$/][callee.callee.property.name=/^(each|for)$/], [callee.tag.object.name=/^(it|test)$/]):not(CallExpression:matches([callee.name=/^(it|test)$/], [callee.object.name=/^(it|test)$/][callee.property.name=/^(only|concurrent)$/]):matches([arguments.0.value=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/], [arguments.0.quasis.0.value.cooked=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/]):has(CallExpression[callee.property.name=/^(toBeTruthy|toBeDefined)$/]):not(:has(CallExpression[callee.property.name=/^to(?!BeTruthy$|BeDefined$)/]))):not(CallExpression:matches([callee.object.name='describe'][callee.property.name=/^(skip|todo)$/], [callee.callee.object.name='describe'][callee.callee.property.name=/^(skipIf|runIf)$/]) CallExpression)) > ExpressionStatement > CallExpression:matches([callee.name=/^(it|test)$/], [callee.object.name=/^(it|test)$/][callee.property.name=/^(only|concurrent)$/]):matches([arguments.0.value=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/], [arguments.0.quasis.0.value.cooked=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/]):has(CallExpression[callee.property.name=/^(toBeTruthy|toBeDefined)$/]):not(:has(CallExpression[callee.property.name=/^to(?!BeTruthy$|BeDefined$)/]))",
          message: "This test only checks that the instance exists, beside other tests that create it anyway. Remove it (rules.md §11)."
        },
        {
          selector: ":matches(Program, BlockStatement):not(:has(CallExpression:matches([callee.name=/^(it|test)$/], [callee.object.name=/^(it|test)$/][callee.property.name=/^(only|fails|concurrent)$/], [callee.callee.object.name=/^(it|test)$/][callee.callee.property.name=/^(each|for)$/], [callee.tag.object.name=/^(it|test)$/]):not(CallExpression:matches([callee.name=/^(it|test)$/], [callee.object.name=/^(it|test)$/][callee.property.name=/^(only|concurrent)$/]):matches([arguments.0.value=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/], [arguments.0.quasis.0.value.cooked=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/]):has(CallExpression[callee.property.name=/^(toBeTruthy|toBeDefined)$/]):not(:has(CallExpression[callee.property.name=/^to(?!BeTruthy$|BeDefined$)/]))):not(CallExpression:matches([callee.object.name='describe'][callee.property.name=/^(skip|todo)$/], [callee.callee.object.name='describe'][callee.callee.property.name=/^(skipIf|runIf)$/]) CallExpression))) > ExpressionStatement:matches([expression.callee.name=/^(it|test)$/], [expression.callee.object.name=/^(it|test)$/][expression.callee.property.name=/^(only|concurrent)$/]):matches([expression.arguments.0.value=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/], [expression.arguments.0.quasis.0.value.cooked=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/]):has(CallExpression[callee.property.name=/^(toBeTruthy|toBeDefined)$/]):not(:has(CallExpression[callee.property.name=/^to(?!BeTruthy$|BeDefined$)/])) ~ ExpressionStatement:matches([expression.callee.name=/^(it|test)$/], [expression.callee.object.name=/^(it|test)$/][expression.callee.property.name=/^(only|concurrent)$/]):matches([expression.arguments.0.value=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/], [expression.arguments.0.quasis.0.value.cooked=/^(should create( an instance| the component)?|should be created|create an instance|should be defined)$/]):has(CallExpression[callee.property.name=/^(toBeTruthy|toBeDefined)$/]):not(:has(CallExpression[callee.property.name=/^to(?!BeTruthy$|BeDefined$)/]))",
          message: "This test only checks that the instance exists, as a test before it does. Remove it (rules.md §11)."
        }
      ]
      /* eslint-enable @stylistic/max-len */
    }
  },
  {
    // The one JavaScript file linted here; webpack loads it as CommonJS under Node.
    files: ['webpack.coverage.config.js'],
    languageOptions: {
      sourceType: 'commonjs',
      globals: globals.node
    }
  }
];
