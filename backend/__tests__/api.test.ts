import request from "supertest";
import app from "../src/index";

// Mock Prisma BEFORE importing anything else
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

// Mock DatabaseUtils
jest.mock("../src/utils/db", () => ({
  DatabaseUtils: {
    testConnection: jest.fn().mockResolvedValue(true),
  },
}));

describe("Udyam Registration API", () => {
  const validRegistrationData = {
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
    enterprise_name: "My Company",
    plant_location: "123 Street, Delhi",
    bank_account: "123456789012345",
    ifsc: "SBIN0001234",
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/udyam/register", () => {
    test("should return 400 for missing required fields", async () => {
      const response = await request(app)
        .post("/api/udyam/register")
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Validation failed");
    });

    test("should handle Prisma unique constraint violation", async () => {
      const { prisma } = require("../src/lib/prisma");

      // Mock no existing application
      prisma.applicants.findUnique.mockResolvedValue(null);

      // FIX: Create Prisma error with proper typing
      const prismaError = new Error("Unique constraint violation") as any;
      prismaError.code = "P2002";
      prismaError.meta = { target: ["aadhaar"] };

      prisma.applicants.create.mockRejectedValue(prismaError);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validRegistrationData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Duplicate entry detected");
    });

    test("should successfully register with valid data", async () => {
      const { prisma } = require("../src/lib/prisma");

      // Mock no existing application
      prisma.applicants.findUnique.mockResolvedValue(null);

      // Mock successful creation
      const mockCreatedApplication = {
        id: 1,
        ...validRegistrationData,
        created_at: new Date(),
        updated_at: new Date(),
      };
      prisma.applicants.create.mockResolvedValue(mockCreatedApplication);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validRegistrationData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.udyam_id).toMatch(/^UDYAM-\d{8}$/);
    });

    test("should handle database connection errors", async () => {
      const { prisma } = require("../src/lib/prisma");

      // Mock database connection error
      const dbError = new Error("Database connection failed") as any;
      dbError.name = "PrismaClientInitializationError";

      prisma.applicants.findUnique.mockRejectedValue(dbError);

      const response = await request(app)
        .post("/api/udyam/register")
        .send(validRegistrationData)
        .expect(500);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe("Internal server error");
    });
  });

  describe("GET /health", () => {
    test("should return health status", async () => {
      const response = await request(app).get("/health").expect(200);

      expect(response.body.status).toBe("Backend is running!");
    });
  });
});
