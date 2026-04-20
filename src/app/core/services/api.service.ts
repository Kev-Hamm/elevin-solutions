import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: string;
  dateOfBirth?: string;
}

export interface Unit {
  id: string;
  name: string;
  capacity: number;
  available: number;
}

export interface OccupancyRequest {
  clientId: string;
  unitId: string;
  startDate: string; // ISO date
}

export interface IntakeSubmissionRequest {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  ssn?: string;
  ageAttested: boolean;
}

@Injectable({ providedIn: 'root' })
export class ApiService {
  private apiUrl = 'https://api.elevinsolutions.us/api';

  constructor(private http: HttpClient) {}

  // Health check
  getHealth(): Observable<any> {
    return this.http.get(`${this.apiUrl}/health`);
  }

  // Clients
  getClients(): Observable<Client[]> {
    return this.http.get<Client[]>(`${this.apiUrl}/clients`);
  }

  createClient(payload: Partial<Client>): Observable<Client> {
    return this.http.post<Client>(`${this.apiUrl}/clients`, payload);
  }

  // Units
  getUnits(): Observable<Unit[]> {
    return this.http.get<Unit[]>(`${this.apiUrl}/units`);
  }

  // Occupancies
  createOccupancy(payload: OccupancyRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/occupancies`, payload);
  }

  // Public intake
  submitIntake(payload: IntakeSubmissionRequest): Observable<any> {
    return this.http.post(`${this.apiUrl}/intake`, payload);
  }
}
