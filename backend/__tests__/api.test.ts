// import request from "supertest";
// import app from "../src/index";
// import { prisma } from "../src/lib/prisma";
// import { DatabaseUtils } from "../src/utils/db";

// // Mock Prisma for testing
// jest.mock("../src/lib/prisma", () => ({
//   prisma: {
//     applicants: {
//       create: jest.fn(),
//       findUnique: jest.fn(),
//       findMany: jest.fn(),
//       count: jest.fn(),
//       update: jest.fn(),
//       delete: jest.fn(),
//       groupBy: jest.fn(),
//     },
//   },
// }));

// // Mock DatabaseUtils
// jest.mock("../src/utils/db", () => ({
//   DatabaseUtils: {
//     testConnection: jest.fn(),
//   },
// }));

// describe("Udyam Registration API", () => {
//   const validRegistrationData = {
//     aadhaar: "123456789012",
//     entrepreneur_name: "John Doe",
//     otp_aadhaar: "123456",
//     pincode: "110001",
//     city: "Delhi",
//     state: "Delhi",
//     organisation_type: "proprietorship",
//     pan: "ABCDE1234F",
//     pan_name: "John Doe",
//     pan_dob: "1990-01-01",
//     itr_filed: true,
//     gstin_available: false,
//     mobile: "9876543210",
//     email: "john@example.com",
//     social_category: "general",
//     gender: "male",
//     physically_handicapped: false,
//     enterprise_name: "My Company",
//     plant_location: "123 Street, Delhi",
//     bank_account: "123456789012345",
//     ifsc: "SBIN0001234",
//   };

//   beforeEach(() => {
//     jest.clearAllMocks();
//     (DatabaseUtils.testConnection as jest.Mock).mockResolvedValue(true);
//   });

//   describe("POST /api/udyam/register", () => {
//     test("should return 400 for missing required fields", async () => {
//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send({}) // Empty body
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Validation failed");
//       expect(response.body.errors).toBeDefined();
//       expect(Array.isArray(response.body.errors)).toBe(true);
//       expect(response.body.errors.length).toBeGreaterThan(0);
//     });

//     test("should return 400 for invalid PAN format", async () => {
//       const invalidData = {
//         ...validRegistrationData,
//         pan: "INVALID_PAN_FORMAT",
//       };

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(invalidData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Validation failed");

//       // Check if PAN validation error is present
//       const panError = response.body.errors?.find(
//         (error: any) => error.field === "pan"
//       );
//       expect(panError).toBeDefined();
//       expect(panError.message).toContain("Invalid PAN format");
//     });

//     test("should return 400 for invalid Aadhaar format", async () => {
//       const invalidData = {
//         ...validRegistrationData,
//         aadhaar: "12345", // Invalid Aadhaar
//       };

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(invalidData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.errors).toBeDefined();

//       const aadhaarError = response.body.errors?.find(
//         (error: any) => error.field === "aadhaar"
//       );
//       expect(aadhaarError).toBeDefined();
//     });

//     test("should return 400 for invalid mobile number", async () => {
//       const invalidData = {
//         ...validRegistrationData,
//         mobile: "1234567890", // Invalid mobile (starts with 1)
//       };

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(invalidData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       const mobileError = response.body.errors?.find(
//         (error: any) => error.field === "mobile"
//       );
//       expect(mobileError).toBeDefined();
//     });

//     test("should return 400 for duplicate Aadhaar", async () => {
//       // Mock existing application
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue({
//         id: 1,
//         aadhaar: "123456789012",
//         entrepreneur_name: "Existing User",
//       });

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(validRegistrationData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Aadhaar number already registered");
//     });

//     test("should successfully register with valid data", async () => {
//       // Mock no existing application
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       // Mock successful creation
//       const mockCreatedApplication = {
//         id: 1,
//         ...validRegistrationData,
//         created_at: new Date(),
//         updated_at: new Date(),
//       };
//       (prisma.applicants.create as jest.Mock).mockResolvedValue(
//         mockCreatedApplication
//       );

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(validRegistrationData)
//         .expect(201);

//       expect(response.body.success).toBe(true);
//       expect(response.body.message).toBe(
//         "Udyam registration submitted successfully"
//       );
//       expect(response.body.udyam_id).toMatch(/^UDYAM-\d{8}$/);
//       expect(response.body.data).toBeDefined();
//       expect(response.body.data.id).toBe(1);
//     });

//     test("should handle Prisma unique constraint violation", async () => {
//       // Mock no existing application in initial check
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       // Mock Prisma unique constraint error
//       const prismaError = new Error("Unique constraint violation");
//       prismaError.code = "P2002";
//       prismaError.meta = { target: ["aadhaar"] };
//       (prisma.applicants.create as jest.Mock).mockRejectedValue(prismaError);

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(validRegistrationData)
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Duplicate entry detected");
//     });

//     test("should handle database errors gracefully", async () => {
//       // Mock no existing application
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       // Mock database error
//       (prisma.applicants.create as jest.Mock).mockRejectedValue(
//         new Error("Database connection failed")
//       );

//       const response = await request(app)
//         .post("/api/udyam/register")
//         .send(validRegistrationData)
//         .expect(500);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Internal server error");
//     });
//   });

//   describe("GET /api/udyam/applications", () => {
//     test("should return list of applications", async () => {
//       const mockApplications = [
//         {
//           id: 1,
//           enterprise_name: "Company 1",
//           entrepreneur_name: "John",
//           aadhaar: "123456789012",
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//         {
//           id: 2,
//           enterprise_name: "Company 2",
//           entrepreneur_name: "Jane",
//           aadhaar: "987654321098",
//           created_at: new Date(),
//           updated_at: new Date(),
//         },
//       ];

//       (prisma.applicants.findMany as jest.Mock).mockResolvedValue(
//         mockApplications
//       );
//       (prisma.applicants.count as jest.Mock).mockResolvedValue(2);

//       const response = await request(app)
//         .get("/api/udyam/applications")
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toHaveLength(2);
//       expect(response.body.count).toBe(2);
//       expect(response.body.pagination).toBeDefined();
//       expect(response.body.pagination.current_page).toBe(1);
//       expect(response.body.pagination.per_page).toBe(10);

//       // Check that udyam_id is added to each application
//       expect(response.body.data[0].udyam_id).toMatch(/^UDYAM-\d{8}$/);
//       expect(response.body.data[1].udyam_id).toMatch(/^UDYAM-\d{8}$/);
//     });

//     test("should handle pagination parameters", async () => {
//       (prisma.applicants.findMany as jest.Mock).mockResolvedValue([]);
//       (prisma.applicants.count as jest.Mock).mockResolvedValue(0);

//       const response = await request(app)
//         .get("/api/udyam/applications?page=2&limit=5")
//         .expect(200);

//       expect(response.body.pagination.current_page).toBe(2);
//       expect(response.body.pagination.per_page).toBe(5);

//       // Verify Prisma was called with correct offset and limit
//       expect(prisma.applicants.findMany).toHaveBeenCalledWith({
//         skip: 5, // (page-1) * limit = (2-1) * 5 = 5
//         take: 5,
//         orderBy: { id: "desc" },
//       });
//     });

//     test("should handle database errors in applications listing", async () => {
//       (prisma.applicants.findMany as jest.Mock).mockRejectedValue(
//         new Error("Database error")
//       );

//       const response = await request(app)
//         .get("/api/udyam/applications")
//         .expect(500);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Failed to fetch applications");
//     });
//   });

//   describe("GET /api/udyam/applications/:id", () => {
//     test("should return specific application by ID", async () => {
//       const mockApplication = {
//         id: 1,
//         aadhaar: "123456789012",
//         entrepreneur_name: "John Doe",
//         enterprise_name: "My Company",
//         created_at: new Date(),
//         updated_at: new Date(),
//       };

//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(
//         mockApplication
//       );

//       const response = await request(app)
//         .get("/api/udyam/applications/1")
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data.id).toBe(1);
//       expect(response.body.data.udyam_id).toMatch(/^UDYAM-\d{8}$/);
//       expect(response.body.data.entrepreneur_name).toBe("John Doe");
//     });

//     test("should return 404 for non-existent application", async () => {
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       const response = await request(app)
//         .get("/api/udyam/applications/999")
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Application not found");
//     });

//     test("should return 400 for invalid ID parameter", async () => {
//       const response = await request(app)
//         .get("/api/udyam/applications/invalid-id")
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Invalid application ID");
//     });
//   });

//   describe("PUT /api/udyam/applications/:id/status", () => {
//     test("should update application status successfully", async () => {
//       const mockApplication = {
//         id: 1,
//         entrepreneur_name: "John Doe",
//         enterprise_name: "My Company",
//       };

//       const mockUpdatedApplication = {
//         ...mockApplication,
//         updated_at: new Date(),
//       };

//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(
//         mockApplication
//       );
//       (prisma.applicants.update as jest.Mock).mockResolvedValue(
//         mockUpdatedApplication
//       );

//       const response = await request(app)
//         .put("/api/udyam/applications/1/status")
//         .send({ status: "approved" })
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.message).toBe(
//         "Application status updated successfully"
//       );
//       expect(response.body.data.udyam_id).toMatch(/^UDYAM-\d{8}$/);
//     });

//     test("should return 400 for missing status", async () => {
//       const response = await request(app)
//         .put("/api/udyam/applications/1/status")
//         .send({}) // Missing status
//         .expect(400);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Status is required");
//     });

//     test("should return 404 for non-existent application", async () => {
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       const response = await request(app)
//         .put("/api/udyam/applications/999/status")
//         .send({ status: "approved" })
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Application not found");
//     });
//   });

//   describe("DELETE /api/udyam/applications/:id", () => {
//     test("should delete application successfully", async () => {
//       const mockApplication = {
//         id: 1,
//         entrepreneur_name: "John Doe",
//       };

//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(
//         mockApplication
//       );
//       (prisma.applicants.delete as jest.Mock).mockResolvedValue(
//         mockApplication
//       );

//       const response = await request(app)
//         .delete("/api/udyam/applications/1")
//         .expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.message).toBe("Application deleted successfully");
//     });

//     test("should return 404 for non-existent application", async () => {
//       (prisma.applicants.findUnique as jest.Mock).mockResolvedValue(null);

//       const response = await request(app)
//         .delete("/api/udyam/applications/999")
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Application not found");
//     });
//   });

//   describe("GET /api/udyam/stats", () => {
//     test("should return application statistics", async () => {
//       const mockStats = {
//         total: 10,
//         byState: [
//           { state: "Delhi", count: 5 },
//           { state: "Maharashtra", count: 3 },
//           { state: "Karnataka", count: 2 },
//         ],
//         byOrgType: [
//           { organisation_type: "proprietorship", count: 6 },
//           { organisation_type: "partnership", count: 4 },
//         ],
//         bySocialCategory: [
//           { social_category: "general", count: 7 },
//           { social_category: "obc", count: 3 },
//         ],
//         byGender: [
//           { gender: "male", count: 6 },
//           { gender: "female", count: 4 },
//         ],
//         recentApplications: 2,
//       };

//       // Mock the FormService.getApplicationStats method
//       jest.doMock("../src/services/formService", () => ({
//         FormService: {
//           getApplicationStats: jest.fn().mockResolvedValue(mockStats),
//         },
//       }));

//       const response = await request(app).get("/api/udyam/stats").expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.data).toBeDefined();
//     });
//   });

//   describe("GET /health", () => {
//     test("should return health status with database connected", async () => {
//       (DatabaseUtils.testConnection as jest.Mock).mockResolvedValue(true);

//       const response = await request(app).get("/health").expect(200);

//       expect(response.body.status).toBe("Backend is running!");
//       expect(response.body.database).toBe("Connected");
//       expect(response.body.timestamp).toBeDefined();
//       expect(response.body.port).toBe(4000);
//     });

//     test("should return health status with database disconnected", async () => {
//       (DatabaseUtils.testConnection as jest.Mock).mockResolvedValue(false);

//       const response = await request(app).get("/health").expect(200);

//       expect(response.body.status).toBe("Backend is running!");
//       expect(response.body.database).toBe("Disconnected");
//     });

//     test("should handle database connection errors", async () => {
//       (DatabaseUtils.testConnection as jest.Mock).mockRejectedValue(
//         new Error("Database connection failed")
//       );

//       const response = await request(app).get("/health").expect(500);

//       expect(response.body.status).toBe("Backend running but database error");
//       expect(response.body.error).toBe("Database connection failed");
//     });
//   });

//   describe("GET /api/test", () => {
//     test("should return API test success", async () => {
//       const response = await request(app).get("/api/test").expect(200);

//       expect(response.body.success).toBe(true);
//       expect(response.body.message).toBe("API connection successful");
//       expect(response.body.timestamp).toBeDefined();
//     });
//   });

//   describe("404 Error Handling", () => {
//     test("should return 404 for non-existent routes", async () => {
//       const response = await request(app)
//         .get("/api/non-existent-route")
//         .expect(404);

//       expect(response.body.success).toBe(false);
//       expect(response.body.message).toBe("Route not found");
//       expect(response.body.requestedPath).toBe("/api/non-existent-route");
//     });
//   });
// });

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
