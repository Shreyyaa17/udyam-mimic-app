import { PrismaClient } from "@prisma/client";

// Mock Prisma client for testing
const mockPrismaClient = {
  applicants: {
    create: jest.fn(),
    findUnique: jest.fn(),
    findMany: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    count: jest.fn(),
    groupBy: jest.fn(),
  },
  $connect: jest.fn(),
  $disconnect: jest.fn(),
  $transaction: jest.fn(),
};

export class TestDatabaseHelpers {
  private static prisma = mockPrismaClient;

  static mockPrismaCreate(returnValue: any) {
    this.prisma.applicants.create.mockResolvedValue(returnValue);
  }

  static mockPrismaFindUnique(returnValue: any) {
    this.prisma.applicants.findUnique.mockResolvedValue(returnValue);
  }

  static mockPrismaFindMany(returnValue: any[]) {
    this.prisma.applicants.findMany.mockResolvedValue(returnValue);
  }

  static mockPrismaCount(returnValue: number) {
    this.prisma.applicants.count.mockResolvedValue(returnValue);
  }

  static mockPrismaUpdate(returnValue: any) {
    this.prisma.applicants.update.mockResolvedValue(returnValue);
  }

  static mockPrismaDelete(returnValue: any) {
    this.prisma.applicants.delete.mockResolvedValue(returnValue);
  }

  static mockPrismaError(error: Error) {
    Object.values(this.prisma.applicants).forEach((method) => {
      if (typeof method === "function") {
        method.mockRejectedValue(error);
      }
    });
  }

  static clearAllMocks() {
    Object.values(this.prisma.applicants).forEach((method) => {
      if (typeof method === "function") {
        method.mockClear();
      }
    });
  }

  static getPrismaMock() {
    return this.prisma;
  }

  // Helper to create realistic database errors
  static createPrismaError(code: string, message: string, meta?: any) {
    const error = new Error(message);
    (error as any).code = code;
    (error as any).meta = meta;
    return error;
  }

  // Common Prisma error types
  static get PRISMA_ERRORS() {
    return {
      UNIQUE_CONSTRAINT: (field: string) =>
        this.createPrismaError("P2002", "Unique constraint failed", {
          target: [field],
        }),

      RECORD_NOT_FOUND: () =>
        this.createPrismaError("P2025", "Record not found"),

      CONNECTION_ERROR: () =>
        this.createPrismaError("P1001", "Database connection error"),

      FOREIGN_KEY_CONSTRAINT: () =>
        this.createPrismaError("P2003", "Foreign key constraint failed"),
    };
  }
}
