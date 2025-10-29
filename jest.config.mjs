import { createDefaultPreset } from 'ts-jest'

const tsjPreset = createDefaultPreset()

/** @type {import('jest').Config} */
const config = {
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
  prettierPath: null,
}

export default config
