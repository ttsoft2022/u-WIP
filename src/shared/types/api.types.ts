// API Response types
export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message?: string;
  data?: T;
}

export interface ApiError {
  code: number;
  message: string;
}
