import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// User interface
interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

// Auth response
interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root'
})
export class SimpleAuthService {
    private apiUrl = 'http://localhost:8085/api/clients';

    constructor(private http: HttpClient) { }

    /**
     * REGISTER - Create new account
     */
    register(username: string, email: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, {
            username,
            email,
            password
        }).pipe(
            tap(response => this.saveToken(response.token))
        );
    }

    /**
     * LOGIN - Sign in
     */
    login(username: string, password: string): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, {
            username,
            password
        }).pipe(
            tap(response => this.saveToken(response.token))
        );
    }

    /**
     * GET USER DETAILS
     */
    getUserDetails(): Observable<User> {
        const headers = this.getAuthHeaders();
        return this.http.get<User>(`${this.apiUrl}/me`, { headers });
    }

    /**
     * LOGOUT
     */
    logout() {
        localStorage.removeItem('auth_token');
    }

    /**
     * Get auth headers with token
     */
    getAuthHeaders(): HttpHeaders {
        const token = localStorage.getItem('auth_token');
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    /**
     * Check if logged in
     */
    isLoggedIn(): boolean {
        return localStorage.getItem('auth_token') !== null;
    }

    // Private helper
    private saveToken(token: string) {
        localStorage.setItem('auth_token', token);
    }
}
