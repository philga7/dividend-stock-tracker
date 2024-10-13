module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/app/$1',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', { tsconfig: 'tsconfig.jest.json' }],
  },
  testMatch: ['**/__tests__/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/tests/'],
  collectCoverageFrom: ['app/**/*.ts', 'app/**/*.tsx'],
};