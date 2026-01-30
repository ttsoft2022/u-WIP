import axios, {AxiosInstance, AxiosError, InternalAxiosRequestConfig} from 'axios';
import {API_TIMEOUT} from '../../constants/api';
import {mmkvStorage} from '../storage/mmkvStorage';
import {STORAGE_KEYS} from '../../constants/storage';
import type {DatabaseConfig} from '../../../features/auth/types/auth.types';

// Create axios instance
const createApiClient = (): AxiosInstance => {
  const instance = axios.create({
    timeout: API_TIMEOUT,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Request interceptor - add base URL from selected database
  instance.interceptors.request.use(
    (config: InternalAxiosRequestConfig) => {
      // Get selected database config
      const dbConfig = mmkvStorage.getObject<DatabaseConfig>(
        STORAGE_KEYS.SELECTED_DATABASE,
      );

      if (dbConfig) {
        // Build base URL: http://{serverIP}/{apiName}
        config.baseURL = `http://${dbConfig.serverIP}/${dbConfig.apiName}`;
      }

      return config;
    },
    error => Promise.reject(error),
  );

  // Response interceptor - handle errors
  instance.interceptors.response.use(
    response => response,
    (error: AxiosError) => {
      if (error.response) {
        const status = error.response.status;
        let message = 'An error occurred';

        switch (status) {
          case 401:
            message = 'Unauthorized - Please login again';
            // Clear auth state if needed
            break;
          case 404:
            message = 'Resource not found';
            break;
          case 500:
            message = 'Server error - Please try again later';
            break;
          default:
            message = `Error: ${status}`;
        }

        return Promise.reject(new Error(message));
      }

      if (error.request) {
        return Promise.reject(new Error('Network error - Please check your connection'));
      }

      return Promise.reject(error);
    },
  );

  return instance;
};

export const apiClient = createApiClient();

// Helper function to get database credentials for API calls
export const getDbCredentials = (): {
  dbIP: string;
  dbName: string;
  dbUsername: string;
  dbPassword: string;
} | null => {
  const dbConfig = mmkvStorage.getObject<DatabaseConfig>(
    STORAGE_KEYS.SELECTED_DATABASE,
  );

  if (!dbConfig) {
    return null;
  }

  return {
    dbIP: dbConfig.dbIP,
    dbName: dbConfig.dbName,
    dbUsername: dbConfig.dbUsername,
    dbPassword: dbConfig.dbPassword,
  };
};
