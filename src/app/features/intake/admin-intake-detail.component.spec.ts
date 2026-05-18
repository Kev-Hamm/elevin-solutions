import { fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, of, throwError } from 'rxjs';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { AdminIntakeDetailComponent } from './admin-intake-detail.component';
import { AdminIntakeService, IntakeSubmissionRecord } from '../../core/services/admin-intake.service';
import { AuthService, User } from '../../core/services/auth.service';

class AdminIntakeServiceStub {
  submission: IntakeSubmissionRecord = {
    id: 'submission-1',
    firstName: 'Ava',
    lastName: 'Stone',
    dateOfBirth: '1990-01-02',
    submittedAt: '2026-04-20T03:00:00.000Z',
    ssn: '***-**-6789',
  };

  getSubmission = jasmine.createSpy('getSubmission').and.callFake(() => of({ submission: this.submission }));
  revealSsn = jasmine.createSpy('revealSsn').and.returnValue(of({ ssn: '6789' }));
  downloadPdf = jasmine.createSpy('downloadPdf').and.returnValue(of(new Blob(['pdf-bytes'], { type: 'application/pdf' })));
}

class AuthServiceStub {
  private subject = new BehaviorSubject<User | null>(null);
  user$ = this.subject.asObservable();

  setUser(user: User | null): void {
    this.subject.next(user);
  }

  getCurrentUserSync(): User | null {
    return this.subject.value;
  }

  getCurrentUser() {
    const user = this.subject.value;
    if (!user) {
      throw new Error('Expected stub user to be set before getCurrentUser()');
    }

    return of({ user });
  }
}

describe('AdminIntakeDetailComponent', () => {
  let fixture: any;
  let component: AdminIntakeDetailComponent;
  let adminIntakeService: AdminIntakeServiceStub;
  let authService: AuthServiceStub;

  const adminUser: User = {
    id: 'admin-1',
    email: 'admin@example.com',
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
  };

  const staffUser: User = {
    id: 'staff-1',
    email: 'staff@example.com',
    firstName: 'Case',
    lastName: 'Worker',
    role: 'staff',
  };

  beforeEach(async () => {
    adminIntakeService = new AdminIntakeServiceStub();
    authService = new AuthServiceStub();

    await TestBed.configureTestingModule({
      imports: [AdminIntakeDetailComponent],
      providers: [
        provideRouter([]),
        { provide: AdminIntakeService, useValue: adminIntakeService },
        { provide: AuthService, useValue: authService },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: convertToParamMap({ id: 'submission-1' }),
            },
          },
        },
      ],
    }).compileComponents();
  });

  function createComponentWithUser(user: User): void {
    authService.setUser(user);
    fixture = TestBed.createComponent(AdminIntakeDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }

  function findButton(label: string): HTMLButtonElement | null {
    return Array.from<HTMLButtonElement>(fixture.nativeElement.querySelectorAll('button'))
      .find((candidate) => candidate.textContent?.includes(label)) || null;
  }

  it('omits the reveal button from the DOM for non-admin users', () => {
    createComponentWithUser(staffUser);

    expect(component.displayedSsn).toBe('***-**-6789');
    expect(fixture.nativeElement.textContent).not.toContain('View SSN last 4');
    expect(fixture.nativeElement.textContent).toContain('Generate printable PDF');
  });

  it('shows a visible countdown after a successful reveal', fakeAsync(() => {
    createComponentWithUser(adminUser);

    const button = findButton('View SSN last 4');
    expect(button?.textContent).toContain('View SSN last 4');

    button?.click();
    fixture.detectChanges();

    expect(adminIntakeService.revealSsn).toHaveBeenCalledOnceWith('submission-1');
    expect(fixture.nativeElement.textContent).toContain('6789');
    expect(fixture.nativeElement.textContent).toContain('Clears in 30s');

    tick(1000);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Clears in 29s');

    tick(component.revealWindowMs - 1000);
    fixture.detectChanges();
  }));

  it('renders safety copy for the staff-only printable PDF action', () => {
    createComponentWithUser(adminUser);

    const text = fixture.nativeElement.textContent;
    expect(text).toContain('Printable intake PDF');
    expect(text).toContain('Staff-only printable PDF with sensitive intake information');
    expect(text).toContain('Print only when needed');
    expect(text).toContain('store any printed copy according to policy');
    expect(text).toContain('Generate printable PDF');
  });

  it('downloads the backend-generated PDF without browser-side PDF composition', () => {
    createComponentWithUser(adminUser);
    const createObjectUrlSpy = spyOn(URL, 'createObjectURL').and.returnValue('blob:pdf-download');
    const revokeObjectUrlSpy = spyOn(URL, 'revokeObjectURL');
    const clickSpy = jasmine.createSpy('click');
    const anchor = document.createElement('a');
    spyOn(anchor, 'click').and.callFake(clickSpy);
    spyOn(document, 'createElement').and.returnValue(anchor);

    findButton('Generate printable PDF')?.click();
    fixture.detectChanges();

    expect(adminIntakeService.downloadPdf).toHaveBeenCalledOnceWith('submission-1');
    expect(createObjectUrlSpy).toHaveBeenCalledWith(jasmine.any(Blob));
    expect(anchor.href).toContain('blob:pdf-download');
    expect(anchor.download).toBe('elevin-intake-submission-1.pdf');
    expect(clickSpy).toHaveBeenCalled();
    expect(revokeObjectUrlSpy).toHaveBeenCalledOnceWith('blob:pdf-download');
  });

  it('shows loading and error copy when PDF generation fails', fakeAsync(() => {
    adminIntakeService.downloadPdf.and.returnValue(throwError(() => ({ error: { message: 'PDF export is unavailable.' } })));
    createComponentWithUser(adminUser);

    component.pdfLoading = true;
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Generating printable PDF...');

    component.pdfLoading = false;
    fixture.detectChanges();
    findButton('Generate printable PDF')?.click();
    flushMicrotasks();
    fixture.detectChanges();

    expect(adminIntakeService.downloadPdf).toHaveBeenCalledOnceWith('submission-1');
    expect(fixture.nativeElement.textContent).toContain('PDF export is unavailable.');
  }));

  it('extracts backend JSON messages from blob PDF error responses', fakeAsync(() => {
    const errorBlob = new Blob([JSON.stringify({ message: 'No token provided' })], { type: 'application/json' });
    adminIntakeService.downloadPdf.and.returnValue(throwError(() => new HttpErrorResponse({ error: errorBlob, status: 401 })));
    createComponentWithUser(adminUser);

    findButton('Generate printable PDF')?.click();
    flushMicrotasks();

    expect(adminIntakeService.downloadPdf).toHaveBeenCalledOnceWith('submission-1');
    component['getPdfErrorMessage'](new HttpErrorResponse({ error: errorBlob, status: 401 })).then(message => {
      expect(message).toBe('No token provided');
    });
    flushMicrotasks();
  }));

  it('auto-clears the revealed SSN back to the masked value after 30 seconds', fakeAsync(() => {
    createComponentWithUser(adminUser);

    const button = findButton('View SSN last 4');
    button?.click();
    fixture.detectChanges();

    expect(component.isSsnRevealed).toBeTrue();
    expect(component.displayedSsn).toBe('6789');

    tick(component.revealWindowMs);
    fixture.detectChanges();

    expect(component.isSsnRevealed).toBeFalse();
    expect(component.displayedSsn).toBe('***-**-6789');
    expect(fixture.nativeElement.textContent).toContain('***-**-6789');
    expect(fixture.nativeElement.textContent).not.toContain('Clears in');
  }));
});
