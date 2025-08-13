import request from "supertest";
import app from "../src/index";

// ✅ CRITICAL: Mock Prisma BEFORE any imports that use it
jest.mock("../src/lib/prisma", () => ({
  prisma: {
    applicants: {
      create: jest.fn(),
      findUnique: jest.fn(),
      findMany: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      groupBy: jest.fn(),
    },
  },
}));

// ✅ Mock DatabaseUtils to prevent real DB connections
jest.mock("../src/utils/db", () => ({
  DatabaseUtils: {
    testConnection: jest.fn().mockResolvedValue(true),
  },
}));

const validUdyamData = {
  aadhaar: "123456789012",
  entrepreneur_name: "John Doe",
  otp_aadhaar: "123456",
  pincode: "110001",
  city: "Delhi",
  state: "Delhi",
  organisation_type: "proprietorship",
  pan: "ABCDE1234F",
  pan_name: "John Doe",
  pan_dob: "1990-01-01",
  itr_filed: true,
  gstin_available: false,
  mobile: "9876543210",
  email: "john@example.com",
  social_category: "general",
  gender: "male",
  physically_handicapped: false,
  enterprise_name: "My Technology Company",
  plant_location: "123 Business Street, Delhi",
  bank_account: "123456789012345",
  ifsc: "SBIN0001234",
};

describe("Integration Tests - Complete Udyam Registration Flow", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("Complete Registration Flow", () => {
    test("should complete full registration process successfully", async () => {
      const { prisma } = require("../src/lib/prisma");

      // ✅ FIXED: Mock no existing application first
      prisma.applicants.findUnique.mockResolvedValue(null);

      // ✅ FIXED: Mock successful creation
      const createdApp = {
        id: 1,
        ...validUdyamData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      prisma.applicants.create.mockResolvedValue(createdApp);

      const submitResponse = await request(app)
        .post("/api/udyam/register")
        .send(validUdyamData)
        .expect(201);

      expect(submitResponse.body.success).toBe(true);
      expect(submitResponse.body.udyam_id).toMatch(/^UDYAM-\d{8}$/);
    });

    test("should prevent duplicate registrations", async () => {
      const { prisma } = require("../src/lib/prisma");

      // ✅ FIXED: Mock existing application to trigger duplicate check
      const existingApp = {
        id: 1,
        ...validUdyamData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      prisma.applicants.findUnique.mockResolvedValue(existingApp);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validUdyamData)
        .expect(400);

      expect(response.body.success).toBe(false);
      // ✅ FIXED: Expected message matches your controller logic
      expect(response.body.message).toBe("Aadhaar number already registered");
    });

    test("should handle validation errors gracefully", async () => {
      const invalidData = {
        ...validUdyamData,
        aadhaar: "12345",
        pan: "INVALID",
        mobile: "1234567890",
      };

      const response = await request(app)
        .post("/api/udyam/register")
        .send(invalidData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });
  });

  describe("Database Error Handling", () => {
    test("should handle unique constraint violations", async () => {
      const { prisma } = require("../src/lib/prisma");

      // ✅ Mock no existing application in initial check
      prisma.applicants.findUnique.mockResolvedValue(null);

      // ✅ FIXED: Create proper Prisma P2002 error
      const uniqueError = new Error("Unique constraint failed") as any;
      uniqueError.code = "P2002";
      uniqueError.meta = { target: ["pan"] };
      uniqueError.name = "PrismaClientKnownRequestError";

      prisma.applicants.create.mockRejectedValue(uniqueError);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validUdyamData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Duplicate entry detected");
    });

    test("should handle database connection errors gracefully", async () => {
      const { prisma } = require("../src/lib/prisma");

      // ✅ FIXED: Create proper PrismaClientInitializationError
      const dbError = new Error("Database connection failed") as any;
      dbError.name = "PrismaClientInitializationError";

      prisma.applicants.findUnique.mockRejectedValue(dbError);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validUdyamData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("Performance and Load Testing", () => {
    test("should handle multiple concurrent registrations", async () => {
      const { prisma } = require("../src/lib/prisma");

      // ✅ Mock unique data for each concurrent request
      prisma.applicants.findUnique.mockResolvedValue(null);

      const promises = [];

      for (let i = 0; i < 5; i++) {
        const testData = {
          ...validUdyamData,
          aadhaar: `12345678901${i}`, // ✅ Unique Aadhaar for each
          pan: `ABCDE123${i}F`, // ✅ Unique PAN for each
          mobile: `987654321${i}`, // ✅ Unique mobile for each
          email: `test${i}@example.com`,
        };

        // ✅ Mock successful creation for each
        prisma.applicants.create.mockResolvedValue({
          id: i + 1,
          ...testData,
          created_at: new Date(),
          updated_at: new Date(),
        });

        promises.push(request(app).post("/api/udyam/register").send(testData));
      }

      const responses = await Promise.all(promises);

      responses.forEach((response) => {
        expect(response.status).toBe(201);
        expect(response.body.success).toBe(true);
      });
    });
  });
});
