import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://api.elevinsolutions.us/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();
  private otpRequiredSubject = new BehaviorSubject<boolean>(false);
  public otpRequired$ = this.otpRequiredSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  /**
   * Register new user
   */
  register(
    email: string,
    password: string,
    firstName: string,
    lastName: string,
    role: string
  ): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/register`, {
        email,
        password,
        firstName,
        lastName,
        role,
      })
      .pipe(
        tap(response => {
          this.storeTokens(response.tokens);
          this.userSubject.next(response.user);
        })
      );
  }

  /**
   * Login with email and password
   */
  login(email: string, password: string): Observable<any> {
    return this.http
      .post<any>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          // Check if OTP is required
          if (response.otpRequired) {
            this.otpRequiredSubject.next(true);
            localStorage.setItem('loginUserId', response.userId);
          } else {
            this.storeTokens(response.tokens);
            this.userSubject.next(response.user);
            this.otpRequiredSubject.next(false);
          }
        })
      );
  }

  /**
   * Send OTP for 2FA
   */
  sendOTP(userId: string, email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/otp/send`, { userId, email });
  }

  /**
   * Verify OTP code
   */
  verifyOTP(userId: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/otp/verify`, {
      userId,
      code,
    });
  }

  /**
   * Enroll in TOTP (authenticator app)
   */
  enrollTOTP(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/totp/enroll`, {});
  }

  /**
   * Verify TOTP code during enrollment
   */
  verifyTOTPSetup(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/totp/verify`, { code });
  }

  /**
   * Verify TOTP code during login
   */
  verifyTOTPLogin(userId: string, code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/totp/verify-login`, {
      userId,
      code,
    });
  }

  /**
   * Get current user
   */
  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`);
  }

  /**
   * Refresh JWT token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = localStorage.getItem('refreshToken');
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/refresh`, { refreshToken })
      .pipe(
        tap(response => {
          this.storeTokens(response.tokens);
        })
      );
  }

  /**
   * Logout
   */
  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('loginUserId');
    this.userSubject.next(null);
    this.otpRequiredSubject.next(false);
  }

  /**
   * Get access token
   */
  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  /**
   * Check if user is logged in
   */
  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  /**
   * Get current user synchronously
   */
  getCurrentUserSync(): User | null {
    return this.userSubject.value;
  }

  /**
   * Store tokens
   */
  private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  /**
   * Load stored user from localStorage (after page reload)
   */
  private loadStoredUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.userSubject.next(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to load stored user', e);
      }
    }
  }
}
