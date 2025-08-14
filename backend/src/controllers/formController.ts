import { Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { udyamRegistrationSchema } from "../validations/formValidation";
import { FormService } from "../services/formService";

export class FormController {
  // Submit Udyam registration
  static async submitUdyamRegistration(req: Request, res: Response) {
    try {
      console.log("Received request body:", JSON.stringify(req.body, null, 2));
      console.log("Request headers:", req.headers["content-type"]);

      // Just to check
      console.log("Received data:", JSON.stringify(req.body, null, 2));
      console.log(
        "Data types:",
        Object.entries(req.body).map(
          ([key, value]) => `${key}: ${typeof value}`
        )
      );

      // Validate the incoming data
      const validatedData = udyamRegistrationSchema.parse(req.body);
      console.log("Data validation successful:", validatedData);

      // Check if Aadhaar already exists
      const existingApplication = await FormService.findByAadhaar(
        validatedData.aadhaar
      );
      console.log(
        "Existing application check:",
        existingApplication ? "Found duplicate" : "No duplicate found"
      );

      if (existingApplication) {
        console.log("Duplicate Aadhaar found for:", validatedData.aadhaar);
        return res.status(400).json({
          success: false,
          message: "Aadhaar number already registered",
        });
      }

      // Create new registration
      console.log("Creating new application...");
      const newApplication = await FormService.createApplication(validatedData);
      console.log("Application created successfully:", newApplication.id);

      const udyamId = `UDYAM-${String(newApplication.id).padStart(8, "0")}`;

      res.status(201).json({
        success: true,
        message: "Udyam registration submitted successfully",
        data: newApplication,
        udyam_id: udyamId,
      });
    } catch (error: any) {
      console.error("FULL ERROR DETAILS:");
      console.error("Error name:", error.name);
      console.error("Error message:", error.message);
      console.error("Error stack:", error.stack);

      if (error.name === "ZodError") {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors: error.errors.map((err: any) => ({
            field: err.path.join("."),
            message: err.message,
            received: err.received,
          })),
        });
      }

      // Handle Prisma unique constraint violations
      if (error.code === "P2002") {
        console.error("Unique constraint violation:", error.meta);
        return res.status(400).json({
          success: false,
          message: "Duplicate entry detected",
          field: error.meta?.target?.[0] || "unknown",
        });
      }

      // Handle other Prisma errors
      if (error.code?.startsWith("P")) {
        console.error("Prisma error:", error.code, error.message);
        return res.status(500).json({
          success: false,
          message: "Database error occurred",
        });
      }

      res.status(500).json({
        success: false,
        message: "Internal server error",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get all applications
  static async getAllApplications(req: Request, res: Response) {
    try {
      console.log("Fetching all applications...");

      // Optional: Add pagination parameters
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const applications = await FormService.getAllApplications(offset, limit);
      const total = await FormService.getApplicationsCount();

      console.log(
        `Fetched ${
          applications.length
        } applications (page ${page} of ${Math.ceil(total / limit)})`
      );

      res.status(200).json({
        success: true,
        data: applications.map((app) => ({
          ...app,
          udyam_id: `UDYAM-${String(app.id).padStart(8, "0")}`,
        })),
        pagination: {
          current_page: page,
          total_pages: Math.ceil(total / limit),
          total_records: total,
          per_page: limit,
        },
        count: applications.length,
      });
    } catch (error: any) {
      console.error("Error fetching applications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch applications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get application by ID
  static async getApplicationById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const applicationId = parseInt(id);

      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID",
        });
      }

      console.log(`Fetching application with ID: ${applicationId}`);

      const application = await FormService.findById(applicationId);

      if (!application) {
        console.log(`Application not found: ${applicationId}`);
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      console.log(`Application found: ${application.enterprise_name}`);

      res.status(200).json({
        success: true,
        data: {
          ...application,
          udyam_id: `UDYAM-${String(application.id).padStart(8, "0")}`,
        },
      });
    } catch (error: any) {
      console.error("Error fetching application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch application",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Update application status
  static async updateApplicationStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;
      const applicationId = parseInt(id);

      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID",
        });
      }

      if (!status) {
        return res.status(400).json({
          success: false,
          message: "Status is required",
        });
      }

      console.log(`Updating application ${applicationId} status to: ${status}`);

      // Check if application exists
      const existingApplication = await FormService.findById(applicationId);
      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      const updatedApplication = await FormService.updateStatus(
        applicationId,
        status
      );

      console.log(`Application status updated successfully: ${applicationId}`);

      res.status(200).json({
        success: true,
        message: "Application status updated successfully",
        data: {
          ...updatedApplication,
          udyam_id: `UDYAM-${String(updatedApplication.id).padStart(8, "0")}`,
        },
      });
    } catch (error: any) {
      console.error("Error updating application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to update application status",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Delete application (optional - for admin use)
  static async deleteApplication(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const applicationId = parseInt(id);

      if (isNaN(applicationId)) {
        return res.status(400).json({
          success: false,
          message: "Invalid application ID",
        });
      }

      console.log(`Deleting application: ${applicationId}`);

      // Check if application exists
      const existingApplication = await FormService.findById(applicationId);
      if (!existingApplication) {
        return res.status(404).json({
          success: false,
          message: "Application not found",
        });
      }

      await FormService.deleteApplication(applicationId);

      console.log(`Application deleted successfully: ${applicationId}`);

      res.status(200).json({
        success: true,
        message: "Application deleted successfully",
      });
    } catch (error: any) {
      console.error("Error deleting application:", error);
      res.status(500).json({
        success: false,
        message: "Failed to delete application",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Get application statistics (optional - for dashboard)
  static async getApplicationStats(req: Request, res: Response) {
    try {
      console.log("Fetching application statistics...");

      const stats = await FormService.getApplicationStats();

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error: any) {
      console.error("Error fetching statistics:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch statistics",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }

  // Search applications (optional - for advanced search)
  static async searchApplications(req: Request, res: Response) {
    try {
      const {
        enterprise_name,
        entrepreneur_name,
        state,
        organisation_type,
        page = 1,
        limit = 10,
      } = req.query;

      console.log("Searching applications with filters:", req.query);

      const searchCriteria = {
        enterprise_name: enterprise_name as string,
        entrepreneur_name: entrepreneur_name as string,
        state: state as string,
        organisation_type: organisation_type as string,
      };

      const offset = (parseInt(page as string) - 1) * parseInt(limit as string);

      const applications = await FormService.searchApplications(
        searchCriteria,
        offset,
        parseInt(limit as string)
      );
      const total = await FormService.getSearchResultsCount(searchCriteria);

      res.status(200).json({
        success: true,
        data: applications.map((app) => ({
          ...app,
          udyam_id: `UDYAM-${String(app.id).padStart(8, "0")}`,
        })),
        pagination: {
          current_page: parseInt(page as string),
          total_pages: Math.ceil(total / parseInt(limit as string)),
          total_records: total,
          per_page: parseInt(limit as string),
        },
        count: applications.length,
      });
    } catch (error: any) {
      console.error("Error searching applications:", error);
      res.status(500).json({
        success: false,
        message: "Failed to search applications",
        error:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  }
}
