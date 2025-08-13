import { UdyamRegistrationData } from "../../src/validations/formValidation";

// Complete valid registration data
export const validUdyamData: UdyamRegistrationData = {
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

// Alternative valid data for testing duplicates
export const validUdyamData2: UdyamRegistrationData = {
  aadhaar: "987654321098",
  entrepreneur_name: "Jane Smith",
  otp_aadhaar: "654321",
  pincode: "400001",
  city: "Mumbai",
  state: "Maharashtra",
  organisation_type: "partnership",
  pan: "ZYXWV9876E",
  pan_name: "Jane Smith",
  pan_dob: "1985-05-15",
  itr_filed: false,
  gstin_available: true,
  mobile: "8765432109",
  email: "jane@example.com",
  social_category: "obc",
  gender: "female",
  physically_handicapped: false,
  enterprise_name: "Smith Enterprises",
  plant_location: "456 Commerce Lane, Mumbai",
  bank_account: "987654321098765",
  ifsc: "HDFC0001234",
};

// Invalid data samples for testing validation
export const invalidUdyamDataSamples = {
  invalidAadhaar: {
    ...validUdyamData,
    aadhaar: "12345", // Too short
  },

  invalidPAN: {
    ...validUdyamData,
    pan: "INVALID_PAN", // Wrong format
  },

  invalidMobile: {
    ...validUdyamData,
    mobile: "1234567890", // Starts with 1 (invalid for India)
  },

  invalidEmail: {
    ...validUdyamData,
    email: "invalid-email", // Not a valid email
  },

  invalidIFSC: {
    ...validUdyamData,
    ifsc: "INVALID", // Wrong format
  },

  invalidBankAccount: {
    ...validUdyamData,
    bank_account: "123", // Too short
  },

  invalidPincode: {
    ...validUdyamData,
    pincode: "1100", // Too short
  },

  missingRequiredFields: {
    aadhaar: "123456789012",
    entrepreneur_name: "Test User",
    // Missing other required fields
  },
};

// Mock database responses
export const mockDatabaseResponses = {
  createdApplication: {
    id: 1,
    ...validUdyamData,
    created_at: new Date("2025-01-01T00:00:00Z"),
    updated_at: new Date("2025-01-01T00:00:00Z"),
  },

  existingApplication: {
    id: 2,
    ...validUdyamData2,
    created_at: new Date("2024-12-01T00:00:00Z"),
    updated_at: new Date("2024-12-01T00:00:00Z"),
  },

  applicationsList: [
    {
      id: 1,
      aadhaar: "123456789012",
      entrepreneur_name: "John Doe",
      enterprise_name: "My Technology Company",
      state: "Delhi",
      organisation_type: "proprietorship",
      created_at: new Date("2025-01-01T00:00:00Z"),
      updated_at: new Date("2025-01-01T00:00:00Z"),
    },
    {
      id: 2,
      aadhaar: "987654321098",
      entrepreneur_name: "Jane Smith",
      enterprise_name: "Smith Enterprises",
      state: "Maharashtra",
      organisation_type: "partnership",
      created_at: new Date("2024-12-01T00:00:00Z"),
      updated_at: new Date("2024-12-01T00:00:00Z"),
    },
  ],

  applicationStats: {
    total: 10,
    byState: [
      { state: "Delhi", count: 5 },
      { state: "Maharashtra", count: 3 },
      { state: "Karnataka", count: 2 },
    ],
    byOrgType: [
      { organisation_type: "proprietorship", count: 6 },
      { organisation_type: "partnership", count: 4 },
    ],
    bySocialCategory: [
      { social_category: "general", count: 7 },
      { social_category: "obc", count: 3 },
    ],
    byGender: [
      { gender: "male", count: 6 },
      { gender: "female", count: 4 },
    ],
    recentApplications: 2,
  },
};

// Step-wise validation data
export const stepWiseValidData = {
  step1: {
    aadhaar: "123456789012",
    entrepreneur_name: "John Doe",
  },

  step2: {
    otp_aadhaar: "123456",
    pincode: "110001",
    city: "Delhi",
    state: "Delhi",
  },

  step3: {
    organisation_type: "proprietorship",
  },

  step4: {
    pan: "ABCDE1234F",
    pan_name: "John Doe",
    pan_dob: "1990-01-01",
  },

  step5: {
    itr_filed: true,
    gstin_available: false,
    mobile: "9876543210",
    email: "john@example.com",
    social_category: "general",
    gender: "male",
    physically_handicapped: false,
  },

  step6: {
    enterprise_name: "My Technology Company",
    plant_location: "123 Business Street, Delhi",
    bank_account: "123456789012345",
    ifsc: "SBIN0001234",
  },
};

// API response templates
export const apiResponseTemplates = {
  success: (data: any, message = "Success") => ({
    success: true,
    message,
    data,
  }),

  error: (message: string, errors?: any[]) => ({
    success: false,
    message,
    ...(errors && { errors }),
  }),

  validationError: (errors: any[]) => ({
    success: false,
    message: "Validation failed",
    errors,
  }),

  notFound: (resource = "Resource") => ({
    success: false,
    message: `${resource} not found`,
  }),

  created: (data: any, udyam_id?: string) => ({
    success: true,
    message: "Udyam registration submitted successfully",
    data,
    ...(udyam_id && { udyam_id }),
  }),
};

// Health check responses
export const healthCheckResponses = {
  healthy: {
    status: "Backend is running!",
    database: "Connected",
    timestamp: new Date().toISOString(),
    port: 4000,
  },

  unhealthy: {
    status: "Backend running but database error",
    error: "Database connection failed",
    timestamp: new Date().toISOString(),
  },
};

// Export commonly used combinations
export const testDataCombinations = {
  validRegistration: validUdyamData,
  duplicateRegistration: validUdyamData2,
  invalidData: invalidUdyamDataSamples,
  stepData: stepWiseValidData,
  dbResponses: mockDatabaseResponses,
  apiTemplates: apiResponseTemplates,
};
