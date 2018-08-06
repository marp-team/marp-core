module.exports = {
  collectCoverageFrom: ['src/**/*.{j,t}s'],
  coveragePathIgnorePatterns: ['/node_modules/', '.*\\.d\\.ts'],
  coverageThreshold: { global: { lines: 95 } },
  transform: {
    '^.*\\.ts$': 'ts-jest',
    '^.*katex\\.s?css$': '<rootDir>/test/_transformers/katex_css.ts',
    '^.*\\.s?css$': '<rootDir>/test/_transformers/css.ts',
  },
  testRegex: '(/(test|__tests__)/(?!_).*|(\\.|/)(test|spec))\\.[jt]s$',
  testURL: 'http://localhost',
  moduleFileExtensions: ['ts', 'js', 'json', 'node'],
}
