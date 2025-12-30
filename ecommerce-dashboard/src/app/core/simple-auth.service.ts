import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

// User interface
interface User {
    id: number;
    username: string;
    email: string;
    role: string;
}

// Login request
interface LoginRequest {
    username: string;
    password: string;
}

// Register request
interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

// Auth response with token
interface AuthResponse {
    token: string;
    user: User;
}

@Injectable({
    providedIn: 'root' // Available everywhere in the app
})
export class AuthService {
    // API URL - change this to your gateway URL
    private apiUrl = 'http://localhost:8085/api/clients';

    // Store current user
    private currentUserSubject = new BehaviorSubject<User | null>(null);
    public currentUser$ = this.currentUserSubject.asObservable();

    constructor(private http: HttpClient) {
        // Check if user is already logged in (token in localStorage)
        this.loadUserFromStorage();
    }

    /**
     * REGISTER - Create new user account
     */
    register(data: RegisterRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/register`, data)
            .pipe(
                tap(response => {
                    // Save token and user info
                    this.saveAuthData(response);
                })
            );
    }

    /**
     * LOGIN - Authenticate user
     */
    login(data: LoginRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${this.apiUrl}/login`, data)
            .pipe(
                tap(response => {
                    // Save token and user info
                    this.saveAuthData(response);
                })
            );
    }

    /**
     * GET USER DETAILS - Fetch current user info
     */
    getUserDetails(): Observable<User> {
        // Get token from storage
        const token = this.getToken();

        // Add token to request headers
        const headers = new HttpHeaders({
            'Authorization': `Bearer ${token}`
        });

        return this.http.get<User>(`${this.apiUrl}/me`, { headers })
            .pipe(
                tap(user => {
                    this.currentUserSubject.next(user);
                })
            );
    }

    /**
     * LOGOUT - Clear user session
     */
    logout() {
        // Remove token from storage
        localStorage.removeItem('auth_token');
        localStorage.removeItem('current_user');

        // Clear current user
        this.currentUserSubject.next(null);

        console.log('User logged out');
    }

    /**
     * Check if user is logged in
     */
    isLoggedIn(): boolean {
        return this.getToken() !== null;
    }

    /**
     * Get current user
     */
    getCurrentUser(): User | null {
        return this.currentUserSubject.value;
    }

    /**
     * Get stored token
     */
    getToken(): string | null {
        return localStorage.getItem('auth_token');
    }

    /**
     * Get headers with authentication token
     * Use this for protected API calls
     */
    getAuthHeaders(): HttpHeaders {
        const token = this.getToken();
        return new HttpHeaders({
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        });
    }

    // ========== PRIVATE HELPER METHODS ==========

    /**
     * Save authentication data to localStorage
     */
    private saveAuthData(response: AuthResponse) {
        // Save token
        localStorage.setItem('auth_token', response.token);

        // Save user info
        localStorage.setItem('current_user', JSON.stringify(response.user));

        // Update current user
        this.currentUserSubject.next(response.user);

        console.log('User logged in:', response.user);
    }

    /**
     * Load user from localStorage on app start
     */
    private loadUserFromStorage() {
        const userJson = localStorage.getItem('current_user');
        if (userJson) {
            try {
                const user = JSON.parse(userJson);
                this.currentUserSubject.next(user);
            } catch (e) {
                console.error('Error loading user from storage');
            }
        }
    }
}

/**
 * HOW TO USE THIS SERVICE:
 * 
 * 1. REGISTER:
 *    this.authService.register({
 *      username: 'john',
 *      email: 'john@example.com',
 *      password: 'password123'
 *    }).subscribe({
 *      next: (response) => console.log('Registered!', response),
 *      error: (error) => console.error('Registration failed', error)
 *    });
 * 
 * 2. LOGIN:
 *    this.authService.login({
 *      username: 'john',
 *      password: 'password123'
 *    }).subscribe({
 *      next: (response) => console.log('Logged in!', response),
 *      error: (error) => console.error('Login failed', error)
 *    });
 * 
 * 3. GET USER DETAILS:
 *    this.authService.getUserDetails().subscribe({
 *      next: (user) => console.log('User:', user),
 *      error: (error) => console.error('Failed to get user', error)
 *    });
 * 
 * 4. LOGOUT:
 *    this.authService.logout();
 * 
 * 5. MAKE AUTHENTICATED API CALL:
 *    this.http.get('http://localhost:8085/api/orders', {
 *      headers: this.authService.getAuthHeaders()
 *    }).subscribe(data => console.log(data));
 */
