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
  collectCoverageFrom: ['src/**/*.{j,t}s', '!src/generated/**/*'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  moduleNameMapper: { '^(.*\\.s[ac]ss)\\?inline$': '$1' },
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?![_.]).*|(\\.|/)(test|spec))\\.[jt]s$',
  transform: {
    '^.+\\.[mc]?[tj]s$': 'babel-jest',
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.js',
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules.join('|')})`],
  prettierPath: null,
}

export default config
