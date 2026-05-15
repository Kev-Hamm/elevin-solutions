import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { ApiService } from './api.service';

describe('ApiService', () => {
  let service: ApiService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ApiService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses the direct API origin for health checks', () => {
    service.getHealth().subscribe();

    const request = httpMock.expectOne('https://api.elevinsolutions.us/api/health');
    expect(request.request.method).toBe('GET');
    request.flush({ status: 'ok', database: 'connected' });
  });

  it('posts public intake to the direct API intake endpoint with the protected field set only', () => {
    const payload = {
      firstName: 'Test',
      lastName: 'Applicant',
      dateOfBirth: '2000-01-01',
      phone: '555-0100',
      email: 'test.applicant@example.test',
      ageAttested: true,
    };

    service.submitIntake(payload).subscribe();

    const request = httpMock.expectOne('https://api.elevinsolutions.us/api/intake');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    expect(Object.keys(request.request.body).sort()).toEqual([
      'ageAttested',
      'dateOfBirth',
      'email',
      'firstName',
      'lastName',
      'phone',
    ]);
    request.flush({ success: true, confirmation: { id: 'mock-confirmation' } });
  });
});
