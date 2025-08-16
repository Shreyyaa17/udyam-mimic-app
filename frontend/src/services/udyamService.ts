import { ApiService, ApiResponse } from "./api";

export interface UdyamRegistrationData {
  aadhaar: string;
  entrepreneur_name: string;
  otp_aadhaar: string;
  pincode: string;
  city: string;
  state: string;
  organisation_type: string;
  pan: string;
  pan_name: string;
  pan_dob: string;
  itr_filed: boolean;
  gstin_available: boolean;
  mobile: string;
  email: string;
  social_category: string;
  gender: string;
  physically_handicapped: boolean;
  enterprise_name: string;
  plant_location: string;
  bank_account: string;
  ifsc: string;
  // Add consent fields for your deployment
  consent_step1: boolean;
  consent_step2: boolean;
  consent_step3: boolean;
  consent_step4: boolean;
  consent_step5: boolean;
  consent_step6: boolean;
}

export interface UdyamApplication extends UdyamRegistrationData {
  id: number;
  udyam_id?: string;
}

export class UdyamService {
  // Get API base URL from environment or fallback
  private static getApiUrl(): string {
    return (
      process.env.NEXT_PUBLIC_API_URL ||
      "https://udyam-backend-k0ju.onrender.com/api"
    );
  }

  // Test backend connection
  static async testConnection(): Promise<ApiResponse> {
    try {
      const apiUrl = this.getApiUrl().replace("/api", ""); // Remove /api for health endpoint
      const response = await fetch(`${apiUrl}/health`);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          message: "Backend connection successful",
        };
      } else {
        return {
          success: false,
          message: `Backend responded with status: ${response.status}`,
        };
      }
    } catch (error) {
      console.error("Connection test error:", error);
      return {
        success: false,
        message: "Cannot connect to backend. Please check your connection.",
      };
    }
  }

  static async submitRegistration(
    data: UdyamRegistrationData
  ): Promise<ApiResponse<UdyamApplication>> {
    try {
      console.log("UdyamService: Submitting registration data:", data);

      // Test connection first
      const connectionTest = await this.testConnection();
      if (!connectionTest.success) {
        return connectionTest;
      }

      const result = await ApiService.post<UdyamApplication>(
        "/api/udyam/register",
        data
      );
      console.log("UdyamService: Backend response:", result);

      return result;
    } catch (error) {
      console.error("UdyamService: Error:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Registration failed",
      };
    }
  }

  static async getAllApplications(): Promise<ApiResponse<UdyamApplication[]>> {
    return ApiService.get<UdyamApplication[]>("/udyam/applications");
  }

  static async getApplicationById(
    id: number
  ): Promise<ApiResponse<UdyamApplication>> {
    return ApiService.get<UdyamApplication>(`/udyam/applications/${id}`);
  }

  // Additional utility method for deployment testing
  static async testApiEndpoint(): Promise<ApiResponse> {
    try {
      const apiUrl = this.getApiUrl();
      const response = await fetch(`${apiUrl}/test`);

      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          data,
          message: "API endpoint test successful",
        };
      } else {
        return {
          success: false,
          message: `API test failed with status: ${response.status}`,
        };
      }
    } catch (error) {
      console.error("API test error:", error);
      return {
        success: false,
        message: "Cannot reach API endpoint",
      };
    }
  }
}
