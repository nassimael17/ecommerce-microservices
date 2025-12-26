export type Role = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  email: string;
  role: Role;
  token: string; // fake token for now
}
