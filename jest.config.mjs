import { createJsWithBabelEsmPreset } from 'ts-jest'

const tsJestPreset = createJsWithBabelEsmPreset()

const esModules = [
  '@shikijs/',
  'ccount',
  'character-entities-',
  'comma-separated-tokens',
  'hast-util-',
  'html-void-elements',
  'property-information',
  'shiki',
  'space-separated-tokens',
  'stringify-entities',
  'zwitch',
]

/** @type {import('jest').Config} */
const config = {
  ...tsJestPreset,
  collectCoverageFrom: ['src/**/*.{j,t}s', '!src/generated/**/*'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?![_.]).*|(\\.|/)(test|spec))\\.[jt]s$',
  transform: {
    ...tsJestPreset.transform,
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.js',
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules.join('|')})`],
  prettierPath: null,
}

export default config
