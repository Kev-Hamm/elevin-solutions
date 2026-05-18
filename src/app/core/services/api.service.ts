import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

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
  status?: string;
  notes?: string;
}

export interface OccupancyRequest {
  clientId: string;
  unitId: string;
  startDate: string; // ISO date
}

export interface IntakeSubmissionRequest {
  dateOfIntake?: string;
  referralAgency?: string;
  staffReceiving?: string;
  programLocation?: string;
  ageAttested: boolean;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  ssn?: string;
  phone: string;
  email: string;
  gender?: string;
  genderSelfDescribe?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  emergencyContactRelationship?: string;
  currentLivingSituation?: string;
  referralSourceType?: string;
  agencyProgramName?: string;
  referrerContactName?: string;
  referrerContactPhone?: string;
  referrerEmail?: string;
  hasIncome?: string;
  incomeType?: string;
  monthlyIncome?: string;
  disabilityAccommodations?: string;
  preferredRoomType?: string;
  adlCapable?: string;
  adlSupportNeeds?: string;
  homeHealthProvider?: string;
  homeHealthAgency?: string;
  onParoleOrProbation?: string;
  poContact?: string;
  registeredSexOffender?: string;
  flaggedForManualReview?: boolean;
  participantInitials?: string;
  participantSignature?: string;
  participantSignatureDate?: string;
  staffName?: string;
  staffSignature?: string;
  staffSignatureDate?: string;
  programAgreement1?: boolean;
  programAgreement2?: boolean;
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
    return this.http.get<Unit[] | { units: any[] }>(`${this.apiUrl}/units`).pipe(
      map((response) => {
        const rawUnits = Array.isArray(response) ? response : response?.units || [];
        return rawUnits.map((unit: any) => ({
          id: unit.id || unit.unitId,
          name: unit.name || unit.location || 'Unit',
          capacity: Number(unit.capacity) || 0,
          available: Number(unit.available ?? (unit.status === 'available' ? unit.capacity : 0)) || 0,
          status: unit.status,
          notes: unit.notes,
        }));
      })
    );
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
