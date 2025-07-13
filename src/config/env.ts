import { API_BASE_URL, API_TIMEOUT } from '@env';

// Simple environment configuration
export const ENV = {
  API_BASE_URL: API_BASE_URL || 'http://localhost:4000',
  API_TIMEOUT: parseInt(API_TIMEOUT) || 10000,
} as const; 

console.log(ENV.API_BASE_URL);