import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthUser, LoginRequest, Role } from './auth.models';
import { ClientsApi } from '../../api/clients.api';
import { of, map, catchError, Observable } from 'rxjs';

const STORAGE_KEY = 'auth_user';
const TOKEN_KEY = 'auth_token';

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
  address?: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ClientsApi);
  private http = inject(HttpClient);
  private _user = signal<AuthUser | null>(this.readFromStorage());

  user = computed(() => this._user());
  isLoggedIn = computed(() => !!this._user());
  token = computed(() => this._user()?.token || null);

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

  // Register new user
  register(payload: RegisterRequest): Observable<boolean> {
    // For now, create a client via the API
    // In a real app, this would call a backend registration endpoint
    return this.http.post<any>('http://localhost:8083/api/clients', {
      fullName: payload.fullName,
      email: payload.email,
      password: payload.password,
      phone: payload.phone || '',
      address: payload.address || ''
    }).pipe(
      map(client => {
        // Auto-login after registration
        const user: AuthUser = {
          id: client.id,
          email: client.email,
          fullName: client.fullName,
          role: 'USER',
          token: this.generateMockToken(client.email, 'USER'),
          phone: client.phone,
          address: client.address
        };
        this.setUser(user);
        return true;
      }),
      catchError(error => {
        console.error('Registration failed:', error);
        return of(false);
      })
    );
  }

  // Get current user details from backend
  getUserDetails(): Observable<AuthUser | null> {
    const currentUser = this._user();
    if (!currentUser || !currentUser.id) {
      return of(null);
    }

    // Fetch fresh user data from backend
    return this.http.get<any>(`http://localhost:8083/api/clients/${currentUser.id}`).pipe(
      map(client => {
        const user: AuthUser = {
          id: client.id,
          email: client.email,
          fullName: client.fullName,
          role: currentUser.role,
          token: currentUser.token,
          phone: client.phone,
          address: client.address
        };
        this.setUser(user);
        return user;
      }),
      catchError(() => of(null))
    );
  }

  // Get JWT token for API requests
  getToken(): string | null {
    return this.token();
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
    if (user.token) {
      localStorage.setItem(TOKEN_KEY, user.token);
    }
    this._user.set(user);
  }

  // Generate mock JWT token (in real app, this comes from backend)
  private generateMockToken(email: string, role: Role): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: email,
      role: role,
      exp: Date.now() + 24 * 60 * 60 * 1000 // 24 hours
    }));
    const signature = btoa('mock-signature');
    return `${header}.${payload}.${signature}`;
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
