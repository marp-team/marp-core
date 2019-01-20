const { jestPreset } = require('ts-jest')

module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  transform: Object.assign({}, jestPreset.transform, {
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.ts',
  }),
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?!_).*|(\\.|/)(test|spec))\\.[jt]s$',
  testURL: 'http://localhost',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
