module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coverageThreshold: { global: { lines: 95 } },
  transform: {
    '^.*\\.ts$': 'ts-jest',
    '^.*\\.s?css$': '<rootDir>/test/_transformers/css.ts',
  },
  testRegex: '(/(test|__tests__)/(?!_).*|(\\.|/)(test|spec))\\.[jt]s$',
  testURL: 'http://localhost',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
