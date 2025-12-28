import { Injectable, signal, computed, inject } from '@angular/core';
import { AuthUser, LoginRequest, Role } from './auth.models';
import { ClientsApi } from '../../api/clients.api';
import { of, map, catchError } from 'rxjs';

const STORAGE_KEY = 'auth_user';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ClientsApi);
  private _user = signal<AuthUser | null>(this.readFromStorage());

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());

  login(payload: LoginRequest) {
    // 1. Check for Admin bypass
    if (payload.email.toLowerCase().includes('admin') && payload.password === 'admin') {
      const user: AuthUser = {
        id: 0,
        email: payload.email.trim(),
        fullName: 'Admin User',
        role: 'ADMIN',
        token: 'fake-admin-token'
      };
      this.setUser(user);
      return of(true);
    }

    // 2. Check against Clients API
    return this.api.list().pipe(
      map(clients => {
        const found = clients.find(c => c.email === payload.email && c.password === payload.password);
        if (found) {
          const user: AuthUser = {
            id: found.id,
            email: found.email,
            fullName: found.fullName,
            role: 'USER',
            token: 'fake-client-token'
          };
          this.setUser(user);
          return true;
        }
        return false;
      }),
      catchError(() => of(false))
    );
  }

  logout() {
    localStorage.removeItem(STORAGE_KEY);
    this._user.set(null);
  }

  hasRole(roles: Role[]) {
    const u = this._user();
    return !!u && roles.includes(u.role);
  }

  updateUser(user: AuthUser) {
    this.setUser(user);
  }

  private setUser(user: AuthUser) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    this._user.set(user);
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
