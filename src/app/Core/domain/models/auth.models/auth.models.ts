export type UserRole = 'SuperAdmin' | 'Support' | 'SupportTeam' | 'AccountAdmin';

export interface AuthUser {
  id: string;
  fullName: string;
  email: string;
  role: UserRole;
  token: string;
  permissions?: string[];
  siteId?: string | null;
  isFirstLogin?: boolean;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  tokenInfo: {
    token: string;
    roleName: UserRole;
    permissions: string[];
  };
  isFirstLogin: boolean;
  siteId?: string;
}
