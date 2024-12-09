module.exports = {
  preset: 'ts-jest',
  transform: {
    '^.+\\.(ts|tsx)?$': ['ts-jest', {tsconfig: './tsconfig.json'}],
  },
  testEnvironment: 'node',
  testPathIgnorePatterns: ['node_modules/', 'dist/', 'mocks/'],
};
