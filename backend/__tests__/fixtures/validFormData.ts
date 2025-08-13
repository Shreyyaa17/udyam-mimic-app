// Additional valid form data variations for comprehensive testing
export const formDataVariations = {
  // Proprietorship business
  proprietorship: {
    aadhaar: "111111111111",
    entrepreneur_name: "Raj Kumar",
    otp_aadhaar: "111111",
    pincode: "560001",
    city: "Bangalore",
    state: "Karnataka",
    organisation_type: "proprietorship",
    pan: "ABCDE1111A",
    pan_name: "Raj Kumar",
    pan_dob: "1988-03-20",
    itr_filed: true,
    gstin_available: true,
    mobile: "9111111111",
    email: "raj@example.com",
    social_category: "general",
    gender: "male",
    physically_handicapped: false,
    enterprise_name: "Raj Tech Solutions",
    plant_location: "Koramangala, Bangalore",
    bank_account: "111111111111111",
    ifsc: "ICIC0001111",
  },

  // Partnership business
  partnership: {
    aadhaar: "222222222222",
    entrepreneur_name: "Priya Sharma",
    otp_aadhaar: "222222",
    pincode: "400002",
    city: "Mumbai",
    state: "Maharashtra",
    organisation_type: "partnership",
    pan: "XYZAB2222B",
    pan_name: "Priya Sharma",
    pan_dob: "1992-07-15",
    itr_filed: false,
    gstin_available: false,
    mobile: "9222222222",
    email: "priya@example.com",
    social_category: "obc",
    gender: "female",
    physically_handicapped: false,
    enterprise_name: "Sharma & Associates",
    plant_location: "Andheri, Mumbai",
    bank_account: "222222222222222",
    ifsc: "HDFC0002222",
  },

  // Private Limited Company
  privateLimited: {
    aadhaar: "333333333333",
    entrepreneur_name: "Amit Patel",
    otp_aadhaar: "333333",
    pincode: "380001",
    city: "Ahmedabad",
    state: "Gujarat",
    organisation_type: "private_limited",
    pan: "PQRST3333C",
    pan_name: "Amit Patel",
    pan_dob: "1985-12-10",
    itr_filed: true,
    gstin_available: true,
    mobile: "9333333333",
    email: "amit@example.com",
    social_category: "general",
    gender: "male",
    physically_handicapped: true,
    enterprise_name: "Patel Industries Pvt Ltd",
    plant_location: "GIDC, Ahmedabad",
    bank_account: "333333333333333",
    ifsc: "SBIN0003333",
  },

  // Different social categories and states
  scCategory: {
    aadhaar: "444444444444",
    entrepreneur_name: "Sunita Devi",
    otp_aadhaar: "444444",
    pincode: "800001",
    city: "Patna",
    state: "Bihar",
    organisation_type: "proprietorship",
    pan: "LMNOP4444D",
    pan_name: "Sunita Devi",
    pan_dob: "1990-09-25",
    itr_filed: false,
    gstin_available: false,
    mobile: "9444444444",
    email: "sunita@example.com",
    social_category: "sc",
    gender: "female",
    physically_handicapped: false,
    enterprise_name: "Devi Handicrafts",
    plant_location: "Boring Road, Patna",
    bank_account: "444444444444444",
    ifsc: "PUNB0004444",
  },

  stCategory: {
    aadhaar: "555555555555",
    entrepreneur_name: "Ravi Tribal",
    otp_aadhaar: "555555",
    pincode: "302001",
    city: "Jaipur",
    state: "Rajasthan",
    organisation_type: "proprietorship",
    pan: "FGHIJ5555E",
    pan_name: "Ravi Tribal",
    pan_dob: "1987-06-12",
    itr_filed: true,
    gstin_available: false,
    mobile: "9555555555",
    email: "ravi@example.com",
    social_category: "st",
    gender: "male",
    physically_handicapped: false,
    enterprise_name: "Tribal Arts & Crafts",
    plant_location: "Pink City, Jaipur",
    bank_account: "555555555555555",
    ifsc: "BARB0005555",
  },
};

// Edge case data for boundary testing
export const edgeCaseData = {
  // Minimum length names
  minLengthName: {
    aadhaar: "666666666666",
    entrepreneur_name: "AB", // Minimum 2 characters
    otp_aadhaar: "666666",
    pincode: "110001",
    city: "DL", // Minimum 2 characters
    state: "DL", // Minimum 2 characters
    organisation_type: "proprietorship",
    pan: "ABCDE6666F",
    pan_name: "AB",
    pan_dob: "2000-01-01",
    itr_filed: false,
    gstin_available: false,
    mobile: "9666666666",
    email: "a@b.co", // Minimum valid email
    social_category: "general",
    gender: "other",
    physically_handicapped: false,
    enterprise_name: "AB", // Minimum 2 characters
    plant_location: "12345", // Minimum 5 characters
    bank_account: "123456789", // Minimum 9 digits
    ifsc: "SBIN0006666",
  },

  // Maximum length bank account
  maxLengthBankAccount: {
    aadhaar: "777777777777",
    entrepreneur_name: "Very Long Business Name Person",
    otp_aadhaar: "777777",
    pincode: "600001",
    city: "Chennai",
    state: "Tamil Nadu",
    organisation_type: "partnership",
    pan: "UVWXY7777G",
    pan_name: "Very Long Business Name Person",
    pan_dob: "1975-11-30",
    itr_filed: true,
    gstin_available: true,
    mobile: "9777777777",
    email: "verylongname@example.com",
    social_category: "obc",
    gender: "female",
    physically_handicapped: true,
    enterprise_name: "Very Long Enterprise Name For Testing Purposes",
    plant_location:
      "Very Long Plant Location Address For Testing Maximum Length Validation",
    bank_account: "123456789012345678", // Maximum 18 digits
    ifsc: "TNSC0007777",
  },
};

// Data for specific test scenarios
export const testScenarios = {
  duplicateAadhaar: {
    original: formDataVariations.proprietorship,
    duplicate: {
      ...formDataVariations.partnership,
      aadhaar: formDataVariations.proprietorship.aadhaar, // Same Aadhaar
    },
  },

  duplicatePAN: {
    original: formDataVariations.proprietorship,
    duplicate: {
      ...formDataVariations.partnership,
      pan: formDataVariations.proprietorship.pan, // Same PAN
    },
  },

  allStatesData: [
    {
      ...formDataVariations.proprietorship,
      state: "Andhra Pradesh",
      city: "Hyderabad",
      pincode: "500001",
    },
    {
      ...formDataVariations.partnership,
      state: "West Bengal",
      city: "Kolkata",
      pincode: "700001",
    },
    {
      ...formDataVariations.privateLimited,
      state: "Tamil Nadu",
      city: "Chennai",
      pincode: "600001",
    },
    {
      ...formDataVariations.scCategory,
      state: "Kerala",
      city: "Kochi",
      pincode: "682001",
    },
    {
      ...formDataVariations.stCategory,
      state: "Punjab",
      city: "Chandigarh",
      pincode: "160001",
    },
  ],
};
