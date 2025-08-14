import {
  udyamRegistrationSchema,
  validatePAN,
  validateAadhaar,
  validateMobile,
  validatePincode,
  validateIFSC,
  validateBankAccount,
} from "../src/validations/formValidation";
import { ZodError } from "zod";

describe("Udyam Registration Validation", () => {
  const validData = {
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

  describe("PAN Validation", () => {
    test("should pass for valid PAN formats", () => {
      expect(validatePAN("ABCDE1234F")).toBe(true);
      expect(validatePAN("XYZKL5678M")).toBe(true);
    });

    test("should fail for invalid PAN formats", () => {
      expect(validatePAN("ABCDE12345")).toBe(false);
      expect(validatePAN("ABCD1234F")).toBe(false);
      expect(validatePAN("abcde1234f")).toBe(false);
      expect(validatePAN("ABCDE1234")).toBe(false);
    });

    test("should trigger validation error for invalid PAN in schema", () => {
      const invalidData = { ...validData, pan: "INVALID_PAN" };

      // FIX: Proper error handling with type assertion
      let caughtError: ZodError | null = null;
      try {
        udyamRegistrationSchema.parse(invalidData);
        fail("Expected validation to throw an error");
      } catch (error) {
        if (error instanceof ZodError) {
          caughtError = error;
        } else {
          throw error;
        }
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError!.errors).toContainEqual(
        expect.objectContaining({
          path: ["pan"],
          message: "Invalid PAN format",
        })
      );
    });
  });

  describe("Aadhaar Validation", () => {
    test("should pass for valid 12-digit Aadhaar", () => {
      expect(validateAadhaar("123456789012")).toBe(true);
      expect(validateAadhaar("999888777666")).toBe(true);
    });

    test("should fail for invalid Aadhaar formats", () => {
      expect(validateAadhaar("12345678901")).toBe(false);
      expect(validateAadhaar("1234567890123")).toBe(false);
      expect(validateAadhaar("12345678901a")).toBe(false);
      expect(validateAadhaar("")).toBe(false);
    });
  });

  describe("Mobile Number Validation", () => {
    test("should pass for valid Indian mobile numbers", () => {
      expect(validateMobile("9876543210")).toBe(true);
      expect(validateMobile("8123456789")).toBe(true);
      expect(validateMobile("7987654321")).toBe(true);
      expect(validateMobile("6111222333")).toBe(true);
    });

    test("should fail for invalid mobile numbers", () => {
      expect(validateMobile("5876543210")).toBe(false);
      expect(validateMobile("987654321")).toBe(false);
      expect(validateMobile("98765432101")).toBe(false);
      expect(validateMobile("987654321a")).toBe(false);
    });
  });

  describe("IFSC Code Validation", () => {
    test("should pass for valid IFSC codes", () => {
      expect(validateIFSC("SBIN0001234")).toBe(true);
      expect(validateIFSC("HDFC0001234")).toBe(true);
      expect(validateIFSC("ICIC0001A23")).toBe(true);
    });

    test("should fail for invalid IFSC codes", () => {
      expect(validateIFSC("SBI0001234")).toBe(false);
      expect(validateIFSC("SBIN1001234")).toBe(false);
      expect(validateIFSC("sbin0001234")).toBe(false);
      expect(validateIFSC("SBIN000123")).toBe(false);
    });
  });

  describe("Bank Account Validation", () => {
    test("should pass for valid bank account numbers", () => {
      expect(validateBankAccount("123456789")).toBe(true);
      expect(validateBankAccount("123456789012345678")).toBe(true);
    });

    test("should fail for invalid bank account numbers", () => {
      expect(validateBankAccount("12345678")).toBe(false);
      expect(validateBankAccount("1234567890123456789")).toBe(false);
      expect(validateBankAccount("12345678901a")).toBe(false);
    });
  });

  describe("Pincode Validation", () => {
    test("should pass for valid 6-digit pincodes", () => {
      expect(validatePincode("110001")).toBe(true);
      expect(validatePincode("400001")).toBe(true);
    });

    test("should fail for invalid pincodes", () => {
      expect(validatePincode("11001")).toBe(false);
      expect(validatePincode("1100011")).toBe(false);
      expect(validatePincode("11000a")).toBe(false);
    });
  });

  describe("Complete Form Validation", () => {
    test("should pass validation for complete valid data", () => {
      expect(() => {
        udyamRegistrationSchema.parse(validData);
      }).not.toThrow();
    });

    test("should fail for missing required fields", () => {
      const incompleteData = {
        aadhaar: "123456789012",
        entrepreneur_name: "John Doe",
      };

      expect(() => {
        udyamRegistrationSchema.parse(incompleteData);
      }).toThrow(ZodError);
    });

    test("should fail for invalid email format", () => {
      const invalidEmailData = { ...validData, email: "invalid-email" };

      expect(() => {
        udyamRegistrationSchema.parse(invalidEmailData);
      }).toThrow(ZodError);
    });

    test("should fail for multiple invalid fields", () => {
      const multipleInvalidData = {
        ...validData,
        aadhaar: "12345",
        pan: "INVALID",
        mobile: "12345",
        email: "invalid-email",
      };

      // FIX: Proper error handling with type guard
      let caughtError: ZodError | null = null;
      try {
        udyamRegistrationSchema.parse(multipleInvalidData);
        fail("Expected validation to fail");
      } catch (error) {
        if (error instanceof ZodError) {
          caughtError = error;
        } else {
          throw error;
        }
      }

      expect(caughtError).not.toBeNull();
      expect(caughtError!.errors.length).toBeGreaterThan(1);
      expect(caughtError!.errors).toContainEqual(
        expect.objectContaining({ path: ["aadhaar"] })
      );
      expect(caughtError!.errors).toContainEqual(
        expect.objectContaining({ path: ["pan"] })
      );
    });

    test("should handle boolean field validation", () => {
      const invalidBooleanData = {
        ...validData,
        itr_filed: "yes" as any, // Force wrong type
        gstin_available: "no" as any,
      };

      expect(() => {
        udyamRegistrationSchema.parse(invalidBooleanData);
      }).toThrow(ZodError);
    });
  });
});
