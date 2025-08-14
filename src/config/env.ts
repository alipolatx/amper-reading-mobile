import { API_TIMEOUT, API_BASE_URL } from '@env';

// Simple environment configuration
export const ENV = {
  // TODO: Change to the correct URL
  API_BASE_URL: API_BASE_URL || 'http://localhost:4000',
  API_TIMEOUT: parseInt(API_TIMEOUT) || 10000,
} as const;
