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
}

export interface UdyamApplication extends UdyamRegistrationData {
  id: number;
  udyam_id?: string;
}

export class UdyamService {
  // Test backend connection
  static async testConnection(): Promise<ApiResponse> {
    try {
      const response = await fetch("http://localhost:4000/health");
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
      return {
        success: false,
        message:
          "Cannot connect to backend. Ensure server is running on http://localhost:4000",
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
        "/udyam/register",
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
}
