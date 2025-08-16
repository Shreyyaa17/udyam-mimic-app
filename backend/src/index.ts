// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { formRoutes } from "./routes/formRoutes";
// import { DatabaseUtils } from "./utils/db";

// dotenv.config();

// const app = express();
// const PORT: number = parseInt(process.env.PORT || "4000", 10);

// // CORS configuration with proper TypeScript types
// const allowedOrigins = [
//   "https://udyam-frontend.onrender.com/",
//   "http://localhost:3000",
//   "http://localhost:3001",
// ];

// const corsOptions = {
//   origin: function (
//     origin: string | undefined,
//     callback: (err: Error | null, allow?: boolean) => void
//   ) {
//     // Allow requests with no origin (mobile apps, Postman, etc.)
//     if (!origin) {
//       return callback(null, true);
//     }

//     if (allowedOrigins.indexOf(origin) !== -1) {
//       callback(null, true);
//     } else {
//       console.log("CORS blocked origin:", origin);
//       callback(new Error("Not allowed by CORS"));
//     }
//   },
//   credentials: true,
//   methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//   allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//   optionsSuccessStatus: 200,
// };

// app.use(cors(corsOptions));

// // Handle preflight requests explicitly
// app.options("/*catchall", cors(corsOptions));

// // Add explicit headers as backup
// app.use((req, res, next) => {
//   const origin = req.headers.origin;
//   if (origin && allowedOrigins.includes(origin)) {
//     res.setHeader("Access-Control-Allow-Origin", origin);
//   }
//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", "true");

//   if (req.method === "OPTIONS") {
//     return res.sendStatus(200);
//   }

//   next();
// });

// // Security headers for production
// app.use((req, res, next) => {
//   res.setHeader("X-Content-Type-Options", "nosniff");
//   res.setHeader("X-Frame-Options", "DENY");
//   res.setHeader("X-XSS-Protection", "1; mode=block");
//   res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
//   next();
// });

// // Body parsing middleware
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Conditional request logging (only in development)
// if (process.env.NODE_ENV !== "production") {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path}`);
//     next();
//   });
// }

// // API Routes
// app.use("/api/udyam", formRoutes);

// app.get("/", (req, res) => {
//   res.json({
//     message: "Udyam Registration API Server",
//     status: "Running",
//     endpoints: {
//       health: "/health",
//       api_test: "/api/test",
//       registration: "/api/udyam/register",
//       applications: "/api/udyam/applications",
//     },
//     documentation:
//       "This is a backend API server for the Udyam Registration System",
//   });
// });

// // Health check endpoint with enhanced information
// app.get("/health", async (req, res) => {
//   try {
//     const dbConnected = await DatabaseUtils.testConnection();
//     res.json({
//       status: "Backend is running!",
//       database: dbConnected ? "Connected" : "Disconnected",
//       timestamp: new Date().toISOString(),
//       port: PORT,
//       environment: process.env.NODE_ENV || "development",
//       version: process.env.npm_package_version || "1.0.0",
//     });
//   } catch (error) {
//     res.status(500).json({
//       status: "Backend running but database error",
//       error: error instanceof Error ? error.message : String(error),
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

// // Test endpoint
// app.get("/api/test", (req, res) => {
//   res.json({
//     success: true,
//     message: "API connection successful",
//     timestamp: new Date().toISOString(),
//     environment: process.env.NODE_ENV || "development",
//   });
// });

// // Production error handling
// app.use(
//   (
//     err: any,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     // Log full error in development, limited in production
//     if (process.env.NODE_ENV === "production") {
//       console.error("Production error:", {
//         message: err.message,
//         stack: err.stack?.split("\n")[0], // Only first line of stack
//         url: req.originalUrl,
//         method: req.method,
//       });
//     } else {
//       console.error("Development error:", err);
//     }

//     res.status(err.status || 500).json({
//       success: false,
//       message:
//         process.env.NODE_ENV === "production"
//           ? "Internal server error"
//           : err.message,
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//       requestId: req.headers["x-request-id"], // For tracking in production logs
//     });
//   }
// );

// // 404 handler
// app.use("/*catchall", (req: express.Request, res: express.Response) => {
//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     requestedPath: req.originalUrl,
//     availableRoutes:
//       process.env.NODE_ENV === "development"
//         ? ["/health", "/api/test", "/api/udyam/register"]
//         : undefined,
//   });
// });

// // Graceful shutdown handling
// const gracefulShutdown = (signal: string) => {
//   console.log(`Received ${signal}. Shutting down gracefully...`);
//   process.exit(0);
// };

// process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
// process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// // Start server with enhanced error handling
// const startServer = async () => {
//   try {
//     const server = app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
//       console.log(`Health check: http://localhost:${PORT}/health`);
//       console.log(`Test API: http://localhost:${PORT}/api/test`);

//       if (process.env.NODE_ENV === "production") {
//         console.log(`Frontend URL: ${process.env.FRONTEND_URL}`);
//       }
//     });

//     // Test database connection
//     await DatabaseUtils.testConnection();
//     console.log("Database connection verified");

//     // Handle server errors
//     server.on("error", (error: any) => {
//       if (error.code === "EADDRINUSE") {
//         console.error(`Port ${PORT} is already in use`);
//       } else {
//         console.error("Server error:", error);
//       }
//       process.exit(1);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// startServer();

// export default app;

// import express from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// import { formRoutes } from "./routes/formRoutes";
// import { DatabaseUtils } from "./utils/db";
// import prisma from "./lib/prisma";

// dotenv.config();

// const app = express();
// const PORT: number = parseInt(process.env.PORT || "4000", 10);

// // CRITICAL CORS CONFIGURATION
// const allowedOrigins = [
//   "https://udyam-frontend.onrender.com",
//   "http://localhost:3000",
//   "http://localhost:3001",
//   "http://127.0.0.1:3000",
// ];

// // Configure CORS middleware FIRST (before any routes)
// app.use(
//   cors({
//     origin: function (origin, callback) {
//       console.log("CORS request from:", origin);

//       // Allow requests with no origin (mobile apps, curl, Postman, server-to-server)
//       if (!origin) {
//         return callback(null, true);
//       }

//       // Check if origin is in allowed list
//       if (allowedOrigins.indexOf(origin) !== -1) {
//         console.log("CORS allowed for:", origin);
//         callback(null, true);
//       } else {
//         console.log("CORS blocked for:", origin);
//         callback(new Error(`CORS not allowed for origin: ${origin}`));
//       }
//     },
//     credentials: true,
//     methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
//     optionsSuccessStatus: 200,
//   })
// );

// // Handle preflight requests explicitly
// app.options("*", cors());

// // Additional explicit CORS headers (safety net)
// app.use((req, res, next) => {
//   const origin = req.headers.origin;

//   // Set CORS headers explicitly for allowed origins
//   if (allowedOrigins.includes(origin as string)) {
//     res.setHeader("Access-Control-Allow-Origin", origin as string);
//   }

//   res.setHeader(
//     "Access-Control-Allow-Methods",
//     "GET, POST, PUT, DELETE, OPTIONS"
//   );
//   res.setHeader(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With"
//   );
//   res.setHeader("Access-Control-Allow-Credentials", "true");

//   // Handle preflight requests
//   if (req.method === "OPTIONS") {
//     console.log("Handling OPTIONS preflight for:", origin);
//     return res.sendStatus(200);
//   }

//   next();
// });

// // Security headers for production
// app.use((req, res, next) => {
//   res.setHeader("X-Content-Type-Options", "nosniff");
//   res.setHeader("X-Frame-Options", "DENY");
//   res.setHeader("X-XSS-Protection", "1; mode=block");
//   res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
//   next();
// });

// // Body parsing middleware
// app.use(express.json({ limit: "10mb" }));
// app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// // Request logging (development only)
// if (process.env.NODE_ENV !== "production") {
//   app.use((req, res, next) => {
//     console.log(`${req.method} ${req.path} - Origin: ${req.headers.origin}`);
//     next();
//   });
// }

// // Database initialization function
// async function initializeDatabase() {
//   try {
//     // Test connection
//     await DatabaseUtils.testConnection();
//     console.log("Database connection verified");

//     // Create tables if they don't exist (development mode)
//     if (process.env.NODE_ENV === "development") {
//       await prisma.$executeRaw`
//         CREATE TABLE IF NOT EXISTS applicants (
//           id SERIAL PRIMARY KEY,
//           aadhaar VARCHAR(12) UNIQUE NOT NULL,
//           entrepreneur_name VARCHAR(255) NOT NULL,
//           enterprise_name VARCHAR(255) NOT NULL,
//           otp_aadhaar VARCHAR(10),
//           pincode VARCHAR(6) NOT NULL,
//           city VARCHAR(100) NOT NULL,
//           state VARCHAR(100) NOT NULL,
//           organisation_type VARCHAR(50) NOT NULL,
//           pan VARCHAR(10) UNIQUE NOT NULL,
//           pan_name VARCHAR(255),
//           pan_dob DATE,
//           itr_filed BOOLEAN DEFAULT false,
//           gstin_available BOOLEAN DEFAULT false,
//           mobile VARCHAR(15) NOT NULL,
//           email VARCHAR(255) NOT NULL,
//           social_category VARCHAR(50) NOT NULL,
//           gender VARCHAR(20) NOT NULL,
//           physically_handicapped BOOLEAN DEFAULT false,
//           plant_location VARCHAR(255),
//           bank_account VARCHAR(50),
//           ifsc VARCHAR(11),
//           consent_step1 BOOLEAN DEFAULT false,
//           consent_step2 BOOLEAN DEFAULT false,
//           consent_step3 BOOLEAN DEFAULT false,
//           consent_step4 BOOLEAN DEFAULT false,
//           consent_step5 BOOLEAN DEFAULT false,
//           consent_step6 BOOLEAN DEFAULT false,
//           created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
//         )
//       `;
//       console.log("Database tables verified/created");
//     }
//   } catch (error) {
//     console.error("Database initialization error:", error);
//   }
// }

// // API Routes
// app.use("/api/udyam", formRoutes);

// // Root endpoint (for when someone visits the base URL)
// app.get("/", (req, res) => {
//   res.json({
//     message: "Udyam Registration API Server",
//     status: "Running",
//     version: "1.0.0",
//     endpoints: {
//       health: "/health",
//       api_test: "/api/test",
//       registration: "POST /api/udyam/register",
//       applications: "GET /api/udyam/applications",
//       search: "GET /api/udyam/search",
//       stats: "GET /api/udyam/stats",
//     },
//     cors: {
//       enabled: true,
//       allowedOrigins: allowedOrigins,
//     },
//     documentation:
//       "This is a backend API server for the Udyam Registration System",
//   });
// });

// // Health check endpoint
// app.get("/health", async (req, res) => {
//   console.log("Health check requested from:", req.headers.origin);

//   try {
//     const dbConnected = await DatabaseUtils.testConnection();

//     res.json({
//       status: "Backend is running!",
//       database: dbConnected ? "Connected" : "Disconnected",
//       timestamp: new Date().toISOString(),
//       port: PORT,
//       environment: process.env.NODE_ENV || "development",
//       version: "1.0.0",
//       cors: {
//         enabled: true,
//         allowedOrigins: allowedOrigins,
//         requestOrigin: req.headers.origin || "none",
//       },
//     });
//   } catch (error) {
//     console.error("Health check error:", error);
//     res.status(500).json({
//       status: "Backend running but database error",
//       error: error instanceof Error ? error.message : String(error),
//       timestamp: new Date().toISOString(),
//     });
//   }
// });

// // API test endpoint
// app.get("/api/test", (req, res) => {
//   console.log("API test requested from:", req.headers.origin);

//   res.json({
//     success: true,
//     message: "API connection successful",
//     timestamp: new Date().toISOString(),
//     cors: "Working",
//     environment: process.env.NODE_ENV || "development",
//     requestOrigin: req.headers.origin || "Direct access",
//     serverInfo: {
//       nodeVersion: process.version,
//       platform: process.platform,
//     },
//   });
// });

// // Production error handling middleware
// app.use(
//   (
//     err: any,
//     req: express.Request,
//     res: express.Response,
//     next: express.NextFunction
//   ) => {
//     console.error("Server Error:", {
//       message: err.message,
//       stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
//       url: req.originalUrl,
//       method: req.method,
//       origin: req.headers.origin,
//     });

//     res.status(err.status || 500).json({
//       success: false,
//       message:
//         process.env.NODE_ENV === "production"
//           ? "Internal server error"
//           : err.message,
//       error: process.env.NODE_ENV === "development" ? err.message : undefined,
//       timestamp: new Date().toISOString(),
//     });
//   }
// );

// // 404 handler (must be last)
// app.use((req: express.Request, res: express.Response) => {
//   console.log(
//     "404 - Route not found:",
//     req.originalUrl,
//     "from:",
//     req.headers.origin
//   );

//   res.status(404).json({
//     success: false,
//     message: "Route not found",
//     requestedPath: req.originalUrl,
//     method: req.method,
//     availableRoutes:
//       process.env.NODE_ENV === "development"
//         ? [
//             "GET /",
//             "GET /health",
//             "GET /api/test",
//             "POST /api/udyam/register",
//             "GET /api/udyam/applications",
//             "GET /api/udyam/search",
//             "GET /api/udyam/stats",
//           ]
//         : undefined,
//     timestamp: new Date().toISOString(),
//   });
// });

// // Graceful shutdown handling
// const gracefulShutdown = (signal: string) => {
//   console.log(`Received ${signal}. Shutting down gracefully...`);

//   // Close database connections
//   prisma
//     .$disconnect()
//     .then(() => {
//       console.log("Database disconnected");
//       process.exit(0);
//     })
//     .catch((error) => {
//       console.error("Error during shutdown:", error);
//       process.exit(1);
//     });
// };

// process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
// process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// // Start server function
// const startServer = async () => {
//   try {
//     // Initialize database
//     await initializeDatabase();

//     // Start Express server
//     const server = app.listen(PORT, () => {
//       console.log(`Server running on port ${PORT}`);
//       console.log(`Environment: ${process.env.NODE_ENV || "development"}`);
//       console.log(`CORS enabled for: ${allowedOrigins.join(", ")}`);
//       console.log(
//         `Health check: https://udyam-backend-k0ju.onrender.com/health`
//       );
//       console.log(`API test: https://udyam-backend-k0ju.onrender.com/api/test`);
//       console.log(
//         `Registration API: https://udyam-backend-k0ju.onrender.com/api/udyam/register`
//       );

//       if (process.env.NODE_ENV === "production") {
//         console.log(
//           `Frontend URL: ${
//             process.env.FRONTEND_URL || "https://udyam-frontend.onrender.com"
//           }`
//         );
//       }
//     });

//     // Handle server errors
//     server.on("error", (error: any) => {
//       if (error.code === "EADDRINUSE") {
//         console.error(`Port ${PORT} is already in use`);
//       } else {
//         console.error("Server error:", error);
//       }
//       process.exit(1);
//     });
//   } catch (error) {
//     console.error("Failed to start server:", error);
//     process.exit(1);
//   }
// };

// // Start the server
// startServer();

// export default app;

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { formRoutes } from "./routes/formRoutes";
import { DatabaseUtils } from "./utils/db";

dotenv.config();

const app = express();
const PORT: number = parseInt(process.env.PORT || "10000", 10); // Use Render's default port

// CORS Configuration
const allowedOrigins = [
  "https://udyam-frontend.onrender.com",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  })
);

// Body parsing
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Routes
app.use("/api/udyam", formRoutes);

// Root route
app.get("/", (req, res) => {
  res.json({
    message: "Udyam Registration API",
    status: "Running",
    endpoints: ["/health", "/api/test", "/api/udyam/register"],
  });
});

// Health check
app.get("/health", async (req, res) => {
  try {
    const dbConnected = await DatabaseUtils.testConnection();
    res.json({
      status: "Backend is running!",
      database: dbConnected ? "Connected" : "Disconnected",
      timestamp: new Date().toISOString(),
      port: PORT,
      environment: process.env.NODE_ENV || "development",
    });
  } catch (error) {
    res.status(500).json({
      status: "Error",
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// API test
app.get("/api/test", (req, res) => {
  res.json({
    success: true,
    message: "API connection successful",
    timestamp: new Date().toISOString(),
  });
});

// Start server - BIND TO 0.0.0.0 for Render
app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
