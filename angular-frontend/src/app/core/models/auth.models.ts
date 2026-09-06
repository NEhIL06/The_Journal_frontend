export interface LoginRequest {
  userName: string;
  password: string;
}

export interface RegistrationRequest extends LoginRequest {
  email: string;
}

export interface UserResponse {
  id?: string;
  userName: string;
  email?: string;
  sentimentAnalysis?: boolean;
  roles?: string[];
}

export interface AuthSession {
  token: string;
  userName: string;
}

export interface ApiErrorResponse {
  status: number;
  error: string;
  message: string;
  path?: string;
  timestamp?: string;
  validationErrors?: Record<string, string>;
}
