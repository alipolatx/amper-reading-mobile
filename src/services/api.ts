import axios, { AxiosInstance } from 'axios';
import { AmperReading, UserStats, ApiResponse, Product, StatsApiResponse } from '../types';
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
        console.log(
          `🚀 API Request: ${config.method?.toUpperCase()} ${config.url}`
        );
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
        console.error(
          '❌ API Response Error:',
          error.response?.status,
          error.message
        );
        console.error('📥 Error Response:', error.response?.data);
        return Promise.reject(error);
      }
    );
  }

  // Health check
  async healthCheck(): Promise<boolean> {
    try {
      const response =
        await this.api.get<ApiResponse<{ message: string }>>('/api/health');
      return response.data.success;
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }

  // Get all products
  async getProducts(): Promise<Product[]> {
    try {
      const response =
        await this.api.get<ApiResponse<Product[]>>('/api/products');

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
      const response = await this.api.get<ApiResponse<UserStats>>(
        `/api/user/${username}/stats`
      );

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
      const response = await this.api.get<ApiResponse<AmperReading[]>>(
        `/api/user/${username}/recent`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch recent readings'
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching recent readings:', error);
      throw error;
    }
  }

  // Get readings with time range filter
  async getReadingsWithTimeRange(
    username: string,
    timeRange: string
  ): Promise<AmperReading[]> {
    try {
      const response = await this.api.get<ApiResponse<AmperReading[]>>(
        `/api/user/${username}/readings?timeRange=${timeRange}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch readings with time range'
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching readings with time range:', error);
      throw error;
    }
  }

  // Get all readings with pagination
  async getAllReadings(
    username: string,
    limit: number = 10,
    page: number = 1
  ): Promise<{
    readings: AmperReading[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const endpoint = username
        ? `/api/user/${username}/all?limit=${limit}&page=${page}`
        : `/api/readings?limit=${limit}&page=${page}`;
      const response = await this.api.get<
        ApiResponse<{
          readings: AmperReading[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>
      >(endpoint);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch all readings'
        );
      }

      return response.data.data;
    } catch (error) {
      console.error('Error fetching all readings:', error);
      throw error;
    }
  }

  // Get users for a specific product with stats
  async getProductUsers(productId: string): Promise<
    Array<{
      username: string;
      readingCount: number;
      lastReading?: string;
    }>
  > {
    try {
      const response = await this.api.get<
        ApiResponse<{
          product: Product;
          users: Array<{
            username: string;
            totalReadings: number;
            averageAmper: number;
            latestReading?: any;
          }>;
        }>
      >(`/api/products/${productId}/users`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch product users'
        );
      }

      // Transform the response to match expected format
      return response.data.data.users.map((user) => ({
        username: user.username,
        readingCount: user.totalReadings,
        lastReading: user.latestReading?.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching product users:', error);
      throw error;
    }
  }

  // Get users for a specific product filtered by sensor
  async getProductUsersBySensor(
    productId: string,
    sensor: string
  ): Promise<
    Array<{
      username: string;
      readingCount: number;
      lastReading?: string;
    }>
  > {
    try {
      const params = new URLSearchParams({
        sensor,
      });

      const response = await this.api.get<
        ApiResponse<{
          product: Product;
          users: Array<{
            username: string;
            totalReadings: number;
            averageAmper: number;
            latestReading?: any;
          }>;
        }>
      >(`/api/products/${productId}/sensor?${params}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch product users by sensor'
        );
      }

      // Transform the response to match expected format
      return response.data.data.users.map((user) => ({
        username: user.username,
        readingCount: user.totalReadings,
        lastReading: user.latestReading?.createdAt,
      }));
    } catch (error) {
      console.error('Error fetching product users by sensor:', error);
      throw error;
    }
  }

  // Get readings for a specific product, user and sensor with pagination
  async getProductUserReadings(
    productId: string,
    username: string,
    sensor: string,
    options?: {
      timeRange?: string;
      limit?: number;
      page?: number;
    }
  ): Promise<{
    readings: AmperReading[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      pages: number;
    };
  }> {
    try {
      const { timeRange = '24h', limit = 10, page = 1 } = options || {};
      console.log(
        `🔍 Fetching readings for product: ${productId}, user: ${username}, sensor: ${sensor}, timeRange: ${timeRange}, page: ${page}`
      );

      const params = new URLSearchParams({
        sensor,
        limit: limit.toString(),
        page: page.toString(),
        ...(timeRange && { timeRange }),
      });

      const response = await this.api.get<
        ApiResponse<{
          product: Product;
          username: string;
          readings: AmperReading[];
          pagination: {
            page: number;
            limit: number;
            total: number;
            pages: number;
          };
        }>
      >(`/api/products/${productId}/users/${username}/readings?${params}`);

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch product user readings'
        );
      }

      return {
        readings: response.data.data.readings,
        pagination: response.data.data.pagination,
      };
    } catch (error) {
      console.error('❌ Error fetching product user readings:', error);
      throw error;
    }
  }

  // Get statistics for a specific product, user and sensor (all data, not paginated)
  async getProductUserStats(
    productId: string,
    username: string,
    sensor: string,
    timeRange: string = '24h'
  ): Promise<UserStats> {
    try {
      console.log(
        `📊 Fetching stats for product: ${productId}, user: ${username}, sensor: ${sensor}, timeRange: ${timeRange}`
      );

      const params = new URLSearchParams({
        sensor,
        timeRange,
      });

      const response = await this.api.get<ApiResponse<StatsApiResponse>>(
        `/api/products/${productId}/users/${username}/readings/stats?${params}`
      );

      if (!response.data.success) {
        throw new Error(
          response.data.message || 'Failed to fetch product user stats'
        );
      }

      // Map the new API response to our UserStats interface
      // Note: API uses different ranges than our UI, but we'll use the counts as-is
      const statsData = response.data.data;
      const stats = statsData.statistics;
      
      const highAmpCount = stats.categories.low + stats.categories.mid + stats.categories.high;
      const lowAmpCount = stats.categories.off;
      const percentage = stats.totalReadings > 0 ? (highAmpCount / stats.totalReadings) * 100 : 0;

      return {
        totalReadings: stats.totalReadings,
        highAmpCount,
        lowAmpCount,
        percentage,
        offCount: stats.categories.off,
        minCount: stats.categories.low,
        midCount: stats.categories.mid,
        maxCount: stats.categories.high,
      };
    } catch (error) {
      console.error('❌ Error fetching product user stats:', error);
      // Fallback: calculate stats from paginated data if stats endpoint doesn't exist
      console.log('📋 Falling back to calculating stats from readings data...');
      throw error;
    }
  }
}

// Export singleton instance
export const apiService = new ApiService();
export default apiService;
