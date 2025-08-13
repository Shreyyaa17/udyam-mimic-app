import { prisma } from "../lib/prisma";
import { UdyamRegistrationData } from "../validations/formValidation";

export class FormService {
  static async createApplication(data: UdyamRegistrationData) {
    return await prisma.applicants.create({
      data: data,
    });
  }

  static async findByAadhaar(aadhaar: string) {
    return await prisma.applicants.findUnique({
      where: { aadhaar },
    });
  }

  static async findById(id: number) {
    return await prisma.applicants.findUnique({
      where: { id },
    });
  }

  static async getAllApplications(offset: number = 0, limit: number = 10) {
    return await prisma.applicants.findMany({
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    });
  }

  static async getApplicationsCount() {
    return await prisma.applicants.count();
  }

  static async deleteApplication(id: number) {
    return await prisma.applicants.delete({
      where: { id },
    });
  }

  static async searchApplications(
    criteria: any,
    offset: number,
    limit: number
  ) {
    const where: any = {};

    if (criteria.enterprise_name) {
      where.enterprise_name = {
        contains: criteria.enterprise_name,
        mode: "insensitive",
      };
    }
    if (criteria.entrepreneur_name) {
      where.entrepreneur_name = {
        contains: criteria.entrepreneur_name,
        mode: "insensitive",
      };
    }
    if (criteria.state) {
      where.state = { equals: criteria.state };
    }
    if (criteria.organisation_type) {
      where.organisation_type = { equals: criteria.organisation_type };
    }

    return await prisma.applicants.findMany({
      where,
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    });
  }

  static async getSearchResultsCount(criteria: any) {
    const where: any = {};

    if (criteria.enterprise_name) {
      where.enterprise_name = {
        contains: criteria.enterprise_name,
        mode: "insensitive",
      };
    }
    if (criteria.entrepreneur_name) {
      where.entrepreneur_name = {
        contains: criteria.entrepreneur_name,
        mode: "insensitive",
      };
    }
    if (criteria.state) {
      where.state = { equals: criteria.state };
    }
    if (criteria.organisation_type) {
      where.organisation_type = { equals: criteria.organisation_type };
    }

    return await prisma.applicants.count({ where });
  }

  static async updateStatus(id: number, status: string) {
    // Add status field update - assuming you have a status field in your schema
    return await prisma.applicants.update({
      where: { id },
      data: {
        // Add status field if it exists in your Prisma schema
        // status: status,
        // For now, just update a field that exists
      },
    });
  }

  static async searchByEnterprise(enterpriseName: string) {
    return await prisma.applicants.findMany({
      where: {
        enterprise_name: {
          contains: enterpriseName,
          mode: "insensitive",
        },
      },
    });
  }

  static async getApplicationStats() {
    const total = await prisma.applicants.count();

    const byState = await prisma.applicants.groupBy({
      by: ["state"],
      _count: true,
    });

    const byOrgType = await prisma.applicants.groupBy({
      by: ["organisation_type"],
      _count: true,
    });

    // Additional useful statistics
    const recentApplications = await prisma.applicants.count({
      where: {
        // If you have created_at field, uncomment this:
        // created_at: {
        //   gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        // },
      },
    });

    const bySocialCategory = await prisma.applicants.groupBy({
      by: ["social_category"],
      _count: true,
    });

    const byGender = await prisma.applicants.groupBy({
      by: ["gender"],
      _count: true,
    });

    return {
      total,
      byState: byState.map((item) => ({
        state: item.state,
        count: item._count,
      })),
      byOrgType: byOrgType.map((item) => ({
        organisation_type: item.organisation_type,
        count: item._count,
      })),
      bySocialCategory: bySocialCategory.map((item) => ({
        social_category: item.social_category,
        count: item._count,
      })),
      byGender: byGender.map((item) => ({
        gender: item.gender,
        count: item._count,
      })),
      recentApplications,
    };
  }

  // Additional utility methods
  static async getApplicationsByState(
    state: string,
    offset: number = 0,
    limit: number = 10
  ) {
    return await prisma.applicants.findMany({
      where: { state },
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    });
  }

  static async getApplicationsByOrgType(
    orgType: string,
    offset: number = 0,
    limit: number = 10
  ) {
    return await prisma.applicants.findMany({
      where: { organisation_type: orgType },
      skip: offset,
      take: limit,
      orderBy: { id: "desc" },
    });
  }

  static async checkDuplicateByPAN(pan: string) {
    return await prisma.applicants.findUnique({
      where: { pan },
    });
  }

  static async checkDuplicateByEmail(email: string) {
    return await prisma.applicants.findFirst({
      where: { email },
    });
  }

  static async getApplicationsByDateRange(startDate: Date, endDate: Date) {
    return await prisma.applicants.findMany({
      where: {
        // Uncomment if you have created_at field:
        // created_at: {
        //   gte: startDate,
        //   lte: endDate,
        // },
      },
      orderBy: { id: "desc" },
    });
  }
}
