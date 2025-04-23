export default {
    testEnvironment: "node",
    transform: {},
    testMatch: ["**/__tests__/**/*.test.js"],
    testPathIgnorePatterns: ["/node_modules/", "/setup/", "/helpers/"],
    verbose: true,
    forceExit: true,
    clearMocks: true,
    resetMocks: true,
    restoreMocks: true,
  }
  