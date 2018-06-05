module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coverageThreshold: { global: { lines: 95 } },
  transform: { '^.+\\.ts$': 'ts-jest' },
  testRegex: '(/(test|__tests__)/.*|(\\.|/)(test|spec))\\.[jt]s$',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
