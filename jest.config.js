const { defaults: tsjPreset } = require('ts-jest/presets')

module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'node',
  testRegex: '(/(test|__tests__)/(?![_.]).*|(\\.|/)(test|spec))\\.[jt]s$',
  transform: {
    ...tsjPreset.transform,
    '^.*\\.s[ac]ss$': '<rootDir>/test/_transformers/sass.js',
  },
}
