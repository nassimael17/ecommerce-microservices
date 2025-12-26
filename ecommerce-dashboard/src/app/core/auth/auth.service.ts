import { Injectable, signal, computed } from '@angular/core';
import { AuthUser, LoginRequest, Role } from './auth.models';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _user = signal<AuthUser | null>(this.readFromStorage());

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  login(payload: LoginRequest) {
    // Fake auth for now (until you implement real auth in backend)
    // Rule: if email contains "admin" => ADMIN else USER
    const role: Role = payload.email.toLowerCase().includes('admin') ? 'ADMIN' : 'USER';

    const user: AuthUser = {
      email: payload.email.trim(),
      role,
      token: 'fake-jwt-token'
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  hasRole(roles: Role[]) {
    const u = this._user();
    return !!u && roles.includes(u.role);
  }

  private readFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
