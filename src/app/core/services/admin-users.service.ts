import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AdminUserRecord {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  status: 'pending' | 'active';
  forcePasswordChangeOnFirstLogin: boolean;
  invitedAt?: string;
  invitedBy?: string;
  invitationEmailSentAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAdminUserPayload {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

@Injectable({
  providedIn: 'root',
})
export class AdminUsersService {
  private apiUrl = 'https://api.elevinsolutions.us/api';

  constructor(private http: HttpClient) {}

  listUsers(): Observable<{ users: AdminUserRecord[] }> {
    return this.http.get<{ users: AdminUserRecord[] }>(`${this.apiUrl}/admin/users`);
  }

  createUser(payload: CreateAdminUserPayload): Observable<{ message: string; user: AdminUserRecord }> {
    return this.http.post<{ message: string; user: AdminUserRecord }>(`${this.apiUrl}/admin/users`, payload);
  }

  resetPassword(userId: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/admin/users/${userId}/reset-password`, {});
  }
}
