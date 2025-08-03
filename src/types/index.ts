// API Response Types
export interface Product {
  _id: string;
  name: string;
  sensors: string[];
  amperreadings: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AmperReading {
  _id: string;
  username: string;
  timestamp: string;
  amper: number;
  createdAt: string;
}

export interface UserStats {
  totalReadings: number;
  highAmpCount: number;
  lowAmpCount: number;
  percentage: number;
  offCount: number;
  minCount: number;
  midCount: number;
  maxCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
  meta?: {
    count: number;
    requestedAt: string;
    timeRange: string;
  };
}

// App State Types
export interface AppState {
  username: string | null;
  isLoading: boolean;
  error: string | null;
  stats: UserStats | null;
  recentReadings: AmperReading[];
}

// Navigation Types
export type RootStackParamList = {
  Products: undefined;
  ProductDetail: { product: Product };
  UserSelection: { product: Product; selectedSensor: string };
  Home: { username: string; product: Product; selectedSensor: string };
}; 