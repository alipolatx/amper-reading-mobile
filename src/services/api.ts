import axios, { AxiosInstance } from 'axios';
import { AmperReading, UserStats, ApiResponse } from '../types';
import { ENV } from '../config/env';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: ENV.API_BASE_URL,
      timeout: ENV.API_TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor for logging
    this.api.interceptors.request.use(
      (config) => {
        console.log(`🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`);
        console.log('🔗 Full URL:', (config.baseURL || '') + (config.url || ''));
        return config;
      },
      (error) => {
        console.error('❌ API Request Error:', error);
        return Promise.reject(error);
      }
    );

    // Response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        console.error('❌ API Response Error:', error.response?.status, error.message);
        console.error('📥 Error Response:', error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.api.get<ApiResponse<{ message: string }>>('/api/health');
      return response.data.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get user statistics
  async getUserStats(username: string): Promise<UserStats> {
    try {
      const response = await this.api.get<ApiResponse<UserStats>>(`/api/user/${username}/stats`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch user stats');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching user stats:', error);
      throw error;
    }
  }

  // Get recent readings (last 24 hours)
  async getRecentReadings(username: string): Promise<AmperReading[]> {
    try {
      const response = await this.api.get<ApiResponse<AmperReading[]>>(`/api/user/${username}/recent`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch recent readings');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent readings:', error);
      throw error;
    }
  }

  // Get all readings with pagination
  async getAllReadings(username: string, limit: number = 50, page: number = 1): Promise<{
    readings: AmperReading[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const response = await this.api.get<ApiResponse<{
        readings: AmperReading[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>>(`/api/user/${username}/all?limit=${limit}&page=${page}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch all readings');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all readings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 