const { jestPreset } = require('ts-jest')

module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  transform: {
    ...jestPreset.transform,
    '^.*\\.s?css$': '<rootDir>/test/_transformers/css.ts',
  },
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?!_).*|(\\.|/)(test|spec))\\.[jt]s$',
  testURL: 'http://localhost',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
