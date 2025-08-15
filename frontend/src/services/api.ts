export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: any;
}

export class ApiService {
  private static baseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    "https://udyam-backend-k0ju.onrender.com/api";

  static async get<T>(endpoint: string): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API GET Error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }

  static async post<T>(endpoint: string, body: any): Promise<ApiResponse<T>> {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      return data;
    } catch (error) {
      console.error("API POST Error:", error);
      return {
        success: false,
        message: "Network error occurred",
      };
    }
  }
}
