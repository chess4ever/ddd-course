module.exports = {
  clearMocks: true,
  globals: {
    "ts-jest": {
      isolatedModules: true,
    },
  },
  resetMocks: true,
  // setupFiles: ['./test/setupTests.ts'],
  // setupFilesAfterEnv: ['./test/destroyDatabaseConnectionAfterwards.ts'],
  testEnvironment: "node",
  testRegex: [".e2e-spec.ts$", ".spec.ts$"],
  transform: {
    "^.+\\.ts$": "ts-jest",
  },
};
