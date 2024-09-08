import js from '@eslint/js'
import eslintConfigPrettier from 'eslint-config-prettier'
import eslintPluginImportX from 'eslint-plugin-import-x'
import eslintPluginJest from 'eslint-plugin-jest'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const tsFiles = ['**/*.ts', '**/*.tsx', '**/*.mts', '**/*.cts']
const testFiles = ['test/**']
const forFiles = (files, confs) => confs.map((conf) => ({ ...conf, files }))

export default tseslint.config(
  js.configs.recommended,
  eslintPluginImportX.flatConfigs.recommended,
  ...forFiles(tsFiles, [
    ...tseslint.configs.recommended,
    eslintPluginImportX.flatConfigs.typescript,
    {
      rules: {
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/explicit-module-boundary-types': 'off',
      },
    },
  ]),
  ...forFiles(testFiles, [
    eslintPluginJest.configs['flat/recommended'],
    eslintPluginJest.configs['flat/style'],
  ]),
  eslintConfigPrettier,
  {
    linterOptions: {
      reportUnusedDisableDirectives: 'error',
    },
    languageOptions: {
      ecmaVersion: 'latest',
      globals: {
        ...globals.node,
        ...globals.browser,
      },
    },
    rules: {
      'import-x/order': ['error', { alphabetize: { order: 'asc' } }],
    },
    settings: {
      'import-x/resolver': 'typescript',
    },
  },
  {
    ignores: [
      'browser.d.ts',
      'coverage/**/*',
      'lib/**/*',
      'node_modules/**/*',
      'sandbox/**/*',
      'tmp/**/*',
      'types/**/*',
    ],
  },
)
