import { z } from "zod";

export const udyamRegistrationSchema = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
  entrepreneur_name: z.string().min(2, "Name must be at least 2 characters"),
  otp_aadhaar: z.string().regex(/^\d{6}$/, "OTP must be 6 digits"),
  pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits"),
  city: z.string().min(2, "City name required"),
  state: z.string().min(2, "State name required"),
  organisation_type: z.string().min(1, "Organisation type required"),
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  pan_name: z.string().min(2, "PAN name required"),
  pan_dob: z.string().min(1, "Date of birth required"),
  itr_filed: z.boolean(),
  gstin_available: z.boolean(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email format"),
  social_category: z.string().min(1, "Social category required"),
  gender: z.string().min(1, "Gender required"),
  physically_handicapped: z.boolean(),
  enterprise_name: z.string().min(2, "Enterprise name required"),
  plant_location: z.string().min(5, "Plant location required"),
  bank_account: z
    .string()
    .regex(/^\d{9,18}$/, "Bank account must be 9-18 digits"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code format"),

  // Update consent validation messages
  consent_step1: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
  consent_step2: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
  consent_step3: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
  consent_step4: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
  consent_step5: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
  consent_step6: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

export type UdyamRegistrationData = z.infer<typeof udyamRegistrationSchema>;

// Additional validation schemas for specific use cases
export const aadhaarValidationSchema = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be 12 digits"),
});

export const panValidationSchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
});

export const mobileValidationSchema = z.object({
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
});

export const emailValidationSchema = z.object({
  email: z.string().email("Invalid email format"),
});

// Partial validation schema for step-wise form validation
export const udyamRegistrationPartialSchema = udyamRegistrationSchema.partial();

// Step-wise validation schemas based on your frontend form steps
// Add consent to Step 1
export const step1ValidationSchema = z.object({
  aadhaar: z.string().regex(/^\d{12}$/, "Aadhaar must be exactly 12 digits"),
  entrepreneur_name: z.string().min(2, "Name must be at least 2 characters"),
  consent_step1: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Add consent to Step 2
export const step2ValidationSchema = z.object({
  otp_aadhaar: z.string().regex(/^\d{6}$/, "OTP must be exactly 6 digits"),
  pincode: z.string().regex(/^\d{6}$/, "Invalid pincode format"),
  city: z.string().min(2, "City name is required"),
  state: z.string().min(2, "State name is required"),
  consent_step2: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Add consent to Step 3
export const step3ValidationSchema = z.object({
  organisation_type: z.enum([
    "proprietorship",
    "partnership",
    "private_limited",
    "public_limited",
  ]),
  consent_step3: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Add consent to Step 4
export const step4ValidationSchema = z.object({
  pan: z.string().regex(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/, "Invalid PAN format"),
  pan_name: z.string().min(2, "PAN name is required"),
  pan_dob: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format"),
  consent_step4: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Add consent to Step 5
export const step5ValidationSchema = z.object({
  itr_filed: z.boolean(),
  gstin_available: z.boolean(),
  mobile: z.string().regex(/^[6-9]\d{9}$/, "Invalid mobile number"),
  email: z.string().email("Invalid email format"),
  social_category: z.enum(["general", "obc", "sc", "st"]),
  gender: z.enum(["male", "female", "other"]),
  physically_handicapped: z.boolean(),
  consent_step5: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Add consent to Step 6
export const step6ValidationSchema = z.object({
  enterprise_name: z.string().min(2, "Enterprise name is required"),
  plant_location: z.string().min(5, "Plant location is required"),
  bank_account: z.string().regex(/^\d{9,18}$/, "Invalid bank account number"),
  ifsc: z.string().regex(/^[A-Z]{4}0[A-Z0-9]{6}$/, "Invalid IFSC code"),
  consent_step6: z.boolean().refine((val) => val === true, {
    message: "Declaration and consent is mandatory for Udyam registration",
  }),
});

// Validation helper functions
export const validateAadhaar = (aadhaar: string): boolean => {
  return /^\d{12}$/.test(aadhaar);
};

export const validatePAN = (pan: string): boolean => {
  return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(pan);
};

export const validateMobile = (mobile: string): boolean => {
  return /^[6-9]\d{9}$/.test(mobile);
};

export const validatePincode = (pincode: string): boolean => {
  return /^\d{6}$/.test(pincode);
};

export const validateIFSC = (ifsc: string): boolean => {
  return /^[A-Z]{4}0[A-Z0-9]{6}$/.test(ifsc);
};

export const validateBankAccount = (account: string): boolean => {
  return /^\d{9,18}$/.test(account);
};

// Enhanced validation with custom error messages
export const createCustomValidationSchema = (
  customMessages?: Partial<Record<keyof UdyamRegistrationData, string>>
) => {
  return z.object({
    aadhaar: z
      .string()
      .regex(
        /^\d{12}$/,
        customMessages?.aadhaar || "Aadhaar must be 12 digits"
      ),
    entrepreneur_name: z
      .string()
      .min(
        2,
        customMessages?.entrepreneur_name ||
          "Name must be at least 2 characters"
      ),
    otp_aadhaar: z
      .string()
      .regex(/^\d{6}$/, customMessages?.otp_aadhaar || "OTP must be 6 digits"),
    pincode: z
      .string()
      .regex(/^\d{6}$/, customMessages?.pincode || "Pincode must be 6 digits"),
    city: z.string().min(2, customMessages?.city || "City name required"),
    state: z.string().min(2, customMessages?.state || "State name required"),
    organisation_type: z
      .string()
      .min(
        1,
        customMessages?.organisation_type || "Organisation type required"
      ),
    pan: z
      .string()
      .regex(
        /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/,
        customMessages?.pan || "Invalid PAN format"
      ),
    pan_name: z
      .string()
      .min(2, customMessages?.pan_name || "PAN name required"),
    pan_dob: z
      .string()
      .min(1, customMessages?.pan_dob || "Date of birth required"),
    itr_filed: z.boolean(),
    gstin_available: z.boolean(),
    mobile: z
      .string()
      .regex(/^[6-9]\d{9}$/, customMessages?.mobile || "Invalid mobile number"),
    email: z.string().email(customMessages?.email || "Invalid email format"),
    social_category: z
      .string()
      .min(1, customMessages?.social_category || "Social category required"),
    gender: z.string().min(1, customMessages?.gender || "Gender required"),
    physically_handicapped: z.boolean(),
    enterprise_name: z
      .string()
      .min(2, customMessages?.enterprise_name || "Enterprise name required"),
    plant_location: z
      .string()
      .min(5, customMessages?.plant_location || "Plant location required"),
    bank_account: z
      .string()
      .regex(
        /^\d{9,18}$/,
        customMessages?.bank_account || "Bank account must be 9-18 digits"
      ),
    ifsc: z
      .string()
      .regex(
        /^[A-Z]{4}0[A-Z0-9]{6}$/,
        customMessages?.ifsc || "Invalid IFSC code format"
      ),
  });
};
