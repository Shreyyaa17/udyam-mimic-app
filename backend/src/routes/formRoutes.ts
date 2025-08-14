import express from "express";
import { FormController } from "../controllers/formController";
import { FormService } from "../services/formService";

const router = express.Router();

// MAIN UDYAM REGISTRATION ROUTES

// POST /api/udyam/register - Submit Udyam registration
router.post("/register", FormController.submitUdyamRegistration);

// GET /api/udyam/applications - Get all applications (with pagination)
router.get("/applications", FormController.getAllApplications);

// GET /api/udyam/applications/:id - Get application by ID
router.get("/applications/:id", FormController.getApplicationById);

// PUT /api/udyam/applications/:id/status - Update application status
router.put("/applications/:id/status", FormController.updateApplicationStatus);

// DELETE /api/udyam/applications/:id - Delete application (admin only)
router.delete("/applications/:id", FormController.deleteApplication);

// ===== ADDITIONAL USEFUL ROUTES =====

// GET /api/udyam/search - Search applications with filters
router.get("/search", FormController.searchApplications);

// GET /api/udyam/stats - Get application statistics
router.get("/stats", FormController.getApplicationStats);

// ===== VALIDATION ROUTES =====

// POST /api/udyam/validate/aadhaar - Check if Aadhaar already exists
router.post("/validate/aadhaar", async (req, res) => {
  try {
    const { aadhaar } = req.body;
    if (!aadhaar || !/^\d{12}$/.test(aadhaar)) {
      return res.status(400).json({
        success: false,
        message: "Invalid Aadhaar format",
      });
    }

    //using FormService to check duplicates
    const exists = await FormService.findByAadhaar(aadhaar);

    res.json({
      success: true,
      available: true, // Change based on actual check
      message: "Aadhaar is available for registration",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating Aadhaar",
    });
  }
});

// POST /api/udyam/validate/pan - Check if PAN already exists
router.post("/validate/pan", async (req, res) => {
  try {
    const { pan } = req.body;
    if (!pan || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan)) {
      return res.status(400).json({
        success: false,
        message: "Invalid PAN format",
      });
    }

    res.json({
      success: true,
      available: true, // Change based on actual check
      message: "PAN is available for registration",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error validating PAN",
    });
  }
});

// ===== UTILITY ROUTES =====

// GET /api/udyam/by-state/:state - Get applications by state
router.get("/by-state/:state", async (req, res) => {
  try {
    const { state } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    // Use FormService method if available
    // const applications = await FormService.getApplicationsByState(state, offset, limit)

    res.json({
      success: true,
      data: [], // Replace with actual data
      pagination: {
        current_page: page,
        per_page: limit,
        state: state,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching applications by state",
    });
  }
});

// GET /api/udyam/by-org-type/:type - Get applications by organization type
router.get("/by-org-type/:type", async (req, res) => {
  try {
    const { type } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const offset = (page - 1) * limit;

    res.json({
      success: true,
      data: [], // Replace with actual data from FormService
      pagination: {
        current_page: page,
        per_page: limit,
        organisation_type: type,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching applications by organization type",
    });
  }
});

// ===== EXPORT ROUTES =====

// GET /api/udyam/export - Export applications as CSV/JSON
router.get("/export", async (req, res) => {
  try {
    const format = (req.query.format as string) || "json";

    if (format === "csv") {
      // Set CSV headers
      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=udyam-applications.csv"
      );
      // Implement CSV export logic here
      res.send("CSV data would go here");
    } else {
      // JSON export
      res.setHeader("Content-Type", "application/json");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=udyam-applications.json"
      );
      res.json({
        success: true,
        data: [], // Replace with actual data
        exported_at: new Date().toISOString(),
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error exporting applications",
    });
  }
});

export { router as formRoutes };
