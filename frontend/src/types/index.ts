// src/types/index.ts

/**
 * User interface representing the authenticated user data
 */
export interface User {
  id: number;
  username: string;
  email: string;
}

/**
 * API response for login endpoint
 */
export interface LoginResponse {
  access_token: string;
  token_type: string;
}

/**
 * API response for registration endpoint
 */
export interface RegisterResponse {
  id: number;
  username: string;
  email: string;
}

/**
 * API error response structure from FastAPI
 */
export interface ApiErrorResponse {
  detail: string;
}

/**
 * Axios error with typed response
 */
export interface AxiosError {
  response?: {
    data?: ApiErrorResponse;
    status: number;
  };
  message: string;
}

/**
 * Type guard to check if an error is an AxiosError
 */
export function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'response' in error &&
    typeof (error as AxiosError).response === 'object'
  );
}

/**
 * Extract error message from various error types
 */
export function getErrorMessage(error: unknown): string {
  if (isAxiosError(error)) {
    return error.response?.data?.detail || error.message || 'An error occurred';
  }
  
  if (error instanceof Error) {
    return error.message;
  }
  
  return 'An unknown error occurred';
}