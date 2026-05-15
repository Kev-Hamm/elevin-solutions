import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminIntakeService } from './admin-intake.service';

describe('AdminIntakeService', () => {
  let service: AdminIntakeService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AdminIntakeService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('requests the admin intake PDF endpoint as a binary blob', () => {
    const expectedPdf = new Blob(['pdf-bytes'], { type: 'application/pdf' });
    let actualPdf: Blob | undefined;

    service.downloadPdf('submission-1').subscribe((pdf) => {
      actualPdf = pdf;
    });

    const req = httpMock.expectOne('https://api.elevinsolutions.us/api/admin/intake/submission-1/pdf');
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');

    req.flush(expectedPdf);
    expect(actualPdf).toEqual(expectedPdf);
  });
});
