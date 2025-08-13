// jest.setup.js
process.env.NODE_ENV = "test";

// ✅ DON'T set any DATABASE_URL for integration tests
// process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/test_db';

jest.setTimeout(10000);

// ✅ Suppress noisy console output during tests
global.console = {
  ...console,
  log: jest.fn(),
  error: jest.fn(),
  warn: jest.fn(),
  info: jest.fn(),
  debug: console.debug, // Keep for actual debugging
};

afterEach(() => {
  jest.clearAllMocks();
});
