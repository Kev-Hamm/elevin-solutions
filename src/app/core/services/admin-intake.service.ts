import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface IntakeSubmissionRecord {
  id: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  submittedAt?: string;
  ssn?: string;
  [key: string]: unknown;
}

@Injectable({ providedIn: 'root' })
export class AdminIntakeService {
  private apiUrl = 'https://api.elevinsolutions.us/api/admin/intake';

  constructor(private http: HttpClient) {}

  listSubmissions(): Observable<{ submissions: IntakeSubmissionRecord[] }> {
    return this.http.get<{ submissions: IntakeSubmissionRecord[] }>(this.apiUrl);
  }

  getSubmission(id: string): Observable<{ submission: IntakeSubmissionRecord }> {
    return this.http.get<{ submission: IntakeSubmissionRecord }>(`${this.apiUrl}/${id}`);
  }

  revealSsn(id: string): Observable<{ ssn: string }> {
    return this.http.get<{ ssn: string }>(`${this.apiUrl}/${id}/ssn`);
  }
}
