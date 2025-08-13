import { Request, Response } from "express";
import { UdyamRegistrationData } from "../../src/validations/formValidation";

// Mock Express Request
export const createMockRequest = (
  body: any = {},
  params: any = {},
  query: any = {}
): Partial<Request> => {
  return {
    body,
    params,
    query,
    headers: {
      "content-type": "application/json",
    },
  };
};

// Mock Express Response
export const createMockResponse = (): Partial<Response> => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  res.send = jest.fn().mockReturnValue(res);
  res.setHeader = jest.fn().mockReturnValue(res);
  return res;
};

// Async test wrapper
export const asyncTest = (fn: () => Promise<void>) => {
  return async () => {
    try {
      await fn();
    } catch (error) {
      console.error("Async test error:", error);
      throw error;
    }
  };
};

// Wait for async operations
export const waitFor = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

// Database test helpers
export const dbTestHelpers = {
  clearTables: async () => {
    // Mock implementation for clearing test database
    console.log("Clearing test database tables");
  },

  seedTestData: async () => {
    // Mock implementation for seeding test data
    console.log("Seeding test database");
  },

  createTestApplication: (overrides: Partial<UdyamRegistrationData> = {}) => {
    return {
      id: 1,
      created_at: new Date(),
      updated_at: new Date(),
      ...overrides,
    };
  },
};

// Validation test helpers
export const validationHelpers = {
  expectValidationError: (result: any, field: string, message?: string) => {
    expect(result.success).toBe(false);
    const fieldError = result.error?.issues?.find((issue: any) =>
      issue.path.includes(field)
    );
    expect(fieldError).toBeDefined();
    if (message) {
      expect(fieldError.message).toContain(message);
    }
  },

  expectValidationSuccess: (result: any) => {
    expect(result.success).toBe(true);
    expect(result.data).toBeDefined();
  },
};

// HTTP status code constants
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
} as const;

// Test data generators
export const generateTestData = {
  aadhaar: () => Math.random().toString().slice(2, 14).padEnd(12, "0"),
  pan: () => {
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    const numbers = "0123456789";
    return (
      Array.from(
        { length: 5 },
        () => letters[Math.floor(Math.random() * letters.length)]
      ).join("") +
      Array.from(
        { length: 4 },
        () => numbers[Math.floor(Math.random() * numbers.length)]
      ).join("") +
      letters[Math.floor(Math.random() * letters.length)]
    );
  },
  mobile: () => {
    const firstDigits = ["6", "7", "8", "9"];
    const first = firstDigits[Math.floor(Math.random() * firstDigits.length)];
    return first + Math.random().toString().slice(2, 11).padEnd(9, "0");
  },
  email: () => `test${Math.random().toString(36).slice(2)}@example.com`,
  ifsc: () => "SBIN0001234", // Mock IFSC for testing
};
