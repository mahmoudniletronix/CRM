export type UserRole = 'SuperAdmin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: string;
  token: string;
  permissions?: string[];
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  roleName: string;
  permissions: string[];
}
