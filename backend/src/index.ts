import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { formRoutes } from "./routes/formRoutes";
import { DatabaseUtils } from "./utils/db";

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "4000", 10);

// CORS configuration with proper TypeScript types
const allowedOrigins = [
  "https://udyam-frontend.onrender.com/",
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsOptions = {
  origin: function (
    origin: string | undefined,
    callback: (err: Error | null, allow?: boolean) => void
  ) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) {
      return callback(null, true);
    }

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      console.log("CORS blocked origin:", origin);
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options("/*catchall", cors(corsOptions));

// Add explicit headers as backup
app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin && allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }

  next();
});

// Security headers for production
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  next();
});

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Conditional request logging (only in development)
if (process.env.NODE_ENV !== "production") {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// API Routes
app.use("/api/udyam", formRoutes);

// Health check endpoint with enhanced information
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await DatabaseUtils.testConnection();
    res.json({
      status: "Backend is running!",
      database: dbConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: process.env.NODE_ENV || "development",
      version: process.env.npm_package_version || "1.0.0",
    });
  } catch (error) {
    res.status(500).json({
      status: "Backend running but database error",
      error: error instanceof Error ? error.message : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

// Test endpoint
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API connection successful",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || "development",
  });
});

// Production error handling
app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    // Log full error in development, limited in production
    if (process.env.NODE_ENV === "production") {
      console.error("Production error:", {
        message: err.message,
        stack: err.stack?.split("\n")[0], // Only first line of stack
        url: req.originalUrl,
        method: req.method,
      });
    } else {
      console.error("Development error:", err);
    }

    res.status(err.status || 500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message,
      error: process.env.NODE_ENV === "development" ? err.message : undefined,
      requestId: req.headers["x-request-id"], // For tracking in production logs
    });
  }
);

// 404 handler
app.use("/*catchall", (req: express.Request, res: express.Response) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    requestedPath: req.originalUrl,
    availableRoutes:
      process.env.NODE_ENV === "development"
        ? ["/health", "/api/test", "/api/udyam/register"]
        : undefined,
  });
});

// Graceful shutdown handling
const gracefulShutdown = (signal: string) => {
  console.log(`Received ${signal}. Shutting down gracefully...`);
  process.exit(0);
};

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Start server with enhanced error handling
const startServer = async () => {
  try {
    const server = app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`Health check: http://localhost:${PORT}/health`);
      console.log(`Test API: http://localhost:${PORT}/api/test`);

      if (process.env.NODE_ENV === "production") {
        console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
      }
    });

    // Test database connection
    await DatabaseUtils.testConnection();
    console.log("Database connection verified");

    // Handle server errors
    server.on("error", (error: any) => {
      if (error.code === "EADDRINUSE") {
        console.error(`Port ${PORT} is already in use`);
      } else {
        console.error("Server error:", error);
      }
      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

export default app;
