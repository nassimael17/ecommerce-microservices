export type Role = 'ADMIN' | 'USER';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: number;
  email: string;
  role: Role;
  token: string; // fake token for now
}
