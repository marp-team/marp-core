const { jestPreset } = require('ts-jest')

module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  globalSetup: '<rootDir>/test/_globalSetup.js',
  setupFiles: ['jest-plugin-context/setup'],
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?!_).*|(\\.|/)(test|spec))\\.[jt]s$',
  transform: {
    ...jestPreset.transform,
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.ts',
  },
}
