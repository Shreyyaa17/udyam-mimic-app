// import { prisma } from "../lib/prisma";

// export class DatabaseUtils {
//   static async testConnection() {
//     try {
//       await prisma.$connect();
//       console.log("Database connected successfully");
//       return true;
//     } catch (error) {
//       console.error("Database connection failed:", error);
//       return false;
//     }
//   }

//   static async closeConnection() {
//     await prisma.$disconnect();
//     console.log("Database connection closed");
//   }

//   static async clearTestData() {
//     if (process.env.NODE_ENV === "test") {
//       await prisma.applicants.deleteMany();
//       console.log("Test data cleared");
//     }
//   }
// }

import prisma from "../lib/prisma";

export class DatabaseUtils {
  static async testConnection() {
    try {
      await prisma.$connect();
      console.log("Database connected successfully");
      return true;
    } catch (error) {
      console.error("Database connection failed:", error);
      return false;
    } finally {
      await prisma.$disconnect();
    }
  }
}

export default prisma;
