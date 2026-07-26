const esModules = [
  '@mathjax/',
  '@shikijs/',
  'beautiful-mermaid',
  'ccount',
  'character-entities-',
  'comma-separated-tokens',
  'hast-util-',
  'html-void-elements',
  'mhchemparser',
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
  moduleNameMapper: {
    '^(.*\\.s[ac]ss)\\?inline$': '$1',
    '^#beautiful-mermaid$': '<rootDir>/src/_beautiful-mermaid.ts',
    '^beautiful-mermaid$':
      '<rootDir>/node_modules/beautiful-mermaid/dist/index.js',
  },
  testEnvironment: 'node',
  testRegex:
    '(/(test|__tests__)/(?![_.]).*|(\\.|/)(test|spec))(?<!\\.d)\\.[jt]s$',
  transform: {
    '^.+\\.[mc]?[tj]s$': 'babel-jest',
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.js',
  },
  transformIgnorePatterns: [`/node_modules/(?!${esModules.join('|')})`],
  prettierPath: null,
}

export default config
