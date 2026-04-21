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
  forcePasswordChangeOnFirstLogin?: boolean;
}

export interface AuthResponse {
  user: User;
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
}

export interface AdminRegisterResponse {
  message: string;
  user: User;
}

export interface LoginResponse {
  requiresTwoFactor: boolean;
  challengeToken: string;
  expiresIn: number;
  user: User;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'https://api.elevinsolutions.us/api';
  private userSubject = new BehaviorSubject<User | null>(null);
  public user$ = this.userSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadStoredUser();
  }

  register(
    email: string,
    firstName: string,
    lastName: string,
    role: string
  ): Observable<AdminRegisterResponse> {
    return this.http.post<AdminRegisterResponse>(`${this.apiUrl}/auth/register`, {
      email,
      firstName,
      lastName,
      role,
    });
  }

  login(email: string, password: string): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.apiUrl}/auth/login`, { email, password })
      .pipe(
        tap(response => {
          localStorage.setItem('otpChallengeToken', response.challengeToken);
          localStorage.setItem('otpExpiresIn', String(response.expiresIn));
          localStorage.setItem('pendingUser', JSON.stringify(response.user));
        })
      );
  }

  verifyOTP(challengeToken: string, otpCode: string): Observable<AuthResponse> {
    return this.http
      .post<AuthResponse>(`${this.apiUrl}/auth/verify-otp`, {
        challengeToken,
        otpCode,
      })
      .pipe(
        tap(response => {
          this.storeTokens(response.tokens);
          this.setCurrentUser(response.user);
          localStorage.removeItem('otpChallengeToken');
          localStorage.removeItem('otpExpiresIn');
          localStorage.removeItem('pendingUser');
        })
      );
  }

  enrollTOTP(): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/totp/enroll`, {});
  }

  verifyTOTPSetup(code: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/auth/totp/verify`, { code });
  }

  getCurrentUser(): Observable<{ user: User }> {
    return this.http.get<{ user: User }>(`${this.apiUrl}/auth/me`).pipe(
      tap(response => {
        this.setCurrentUser(response.user);
      })
    );
  }

  changePassword(currentPassword: string, newPassword: string): Observable<{ message: string }> {
    return this.http.patch<{ message: string }>(`${this.apiUrl}/auth/users/me/password`, {
      currentPassword,
      newPassword,
    }).pipe(
      tap(() => {
        const user = this.userSubject.value;
        if (user?.forcePasswordChangeOnFirstLogin) {
          this.setCurrentUser({ ...user, forcePasswordChangeOnFirstLogin: false });
        }
      })
    );
  }

  completePasswordSetup(token: string, newPassword: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/auth/password/setup`, {
      token,
      newPassword,
    });
  }

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

  logout(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('otpChallengeToken');
    localStorage.removeItem('otpExpiresIn');
    localStorage.removeItem('pendingUser');
    this.userSubject.next(null);
  }

  getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  isLoggedIn(): boolean {
    return !!this.getAccessToken();
  }

  getCurrentUserSync(): User | null {
    return this.userSubject.value;
  }

  getChallengeToken(): string | null {
    return localStorage.getItem('otpChallengeToken');
  }

  getOtpExpiresIn(): number {
    return Number(localStorage.getItem('otpExpiresIn') || '300');
  }

  needsPasswordChange(): boolean {
    return Boolean(this.userSubject.value?.forcePasswordChangeOnFirstLogin);
  }

  private setCurrentUser(user: User | null): void {
    this.userSubject.next(user);
    if (user) {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('currentUser');
    }
  }

  private storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
    localStorage.setItem('accessToken', tokens.accessToken);
    localStorage.setItem('refreshToken', tokens.refreshToken);
  }

  private loadStoredUser(): void {
    const stored = localStorage.getItem('currentUser');
    if (stored) {
      try {
        this.userSubject.next(JSON.parse(stored));
      } catch {
        localStorage.removeItem('currentUser');
      }
    }
  }
}
