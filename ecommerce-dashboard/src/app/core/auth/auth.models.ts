export type Role = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  fullName?: string;
  email: string;
  role: Role;
  token: string;
  phone?: string;
  address?: string;
}
