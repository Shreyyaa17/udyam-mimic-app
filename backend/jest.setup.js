// jest.setup.js
process.env.NODE_ENV = "test";

jest.setTimeout(10000);

// Suppress noisy console output during tests
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
