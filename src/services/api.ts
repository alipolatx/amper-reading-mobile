import axios, { AxiosInstance } from 'axios';
import { AmperReading, UserStats, ApiResponse, Product } from '../types';
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

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response = await this.api.get<ApiResponse<Product[]>>('/api/products');
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch products');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching products:', error);
      throw error;
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

  // Get readings with time range filter
  async getReadingsWithTimeRange(username: string, timeRange: string): Promise<AmperReading[]> {
    try {
      const response = await this.api.get<ApiResponse<AmperReading[]>>(`/api/user/${username}/readings?timeRange=${timeRange}`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch readings with time range');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching readings with time range:', error);
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
      const endpoint = username ? `/api/user/${username}/all?limit=${limit}&page=${page}` : `/api/readings?limit=${limit}&page=${page}`;
      const response = await this.api.get<ApiResponse<{
        readings: AmperReading[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>>(endpoint);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch all readings');
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all readings:', error);
      throw error;
    }
  }

  // Get users for a specific product with stats
  async getProductUsers(productId: string): Promise<Array<{
    username: string;
    readingCount: number;
    lastReading?: string;
  }>> {
    try {
      const response = await this.api.get<ApiResponse<{
        product: Product;
        users: Array<{
          username: string;
          totalReadings: number;
          averageAmper: number;
          latestReading?: any;
        }>;
      }>>(`/api/products/${productId}/users`);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch product users');
      }

      // Transform the response to match expected format
      return response.data.data.users.map(user => ({
        username: user.username,
        readingCount: user.totalReadings,
        lastReading: user.latestReading?.timestamp
      }));
    } catch (error) {
      console.error('Error fetching product users:', error);
      throw error;
    }
  }

  // Get readings for a specific product and user
  async getProductUserReadings(productId: string, username: string, timeRange: string = '24h'): Promise<AmperReading[]> {
    try {
      console.log(`🔍 Fetching readings for product: ${productId}, user: ${username}, timeRange: ${timeRange}`);
      const response = await this.api.get<ApiResponse<{
        product: Product;
        username: string;
        readings: AmperReading[];
        pagination: {
          page: number;
          limit: number;
          total: number;
          pages: number;
        };
      }>>(`/api/products/${productId}/users/${username}?timeRange=${timeRange}`);
      
      console.log('📊 Product user readings response:', response.data);
      
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to fetch product user readings');
      }

      return response.data.data.readings;
    } catch (error) {
      console.error('❌ Error fetching product user readings:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService; 