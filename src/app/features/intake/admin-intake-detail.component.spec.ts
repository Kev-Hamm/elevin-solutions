import { fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BehaviorSubject, of } from 'rxjs';
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
  revealSsn = jasmine.createSpy('revealSsn').and.returnValue(of({ ssn: '123-45-6789' }));
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

  const caseworkerUser: User = {
    id: 'caseworker-1',
    email: 'caseworker@example.com',
    firstName: 'Case',
    lastName: 'Worker',
    role: 'caseworker',
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

  it('omits the reveal button from the DOM for non-admin users', () => {
    createComponentWithUser(caseworkerUser);

    expect(component.displayedSsn).toBe('***-**-6789');
    expect(fixture.nativeElement.textContent).not.toContain('View full SSN');
    expect(fixture.nativeElement.querySelector('button')).toBeNull();
  });

  it('shows a visible countdown after a successful reveal', fakeAsync(() => {
    createComponentWithUser(adminUser);

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    expect(button?.textContent).toContain('View full SSN');

    button?.click();
    fixture.detectChanges();

    expect(adminIntakeService.revealSsn).toHaveBeenCalledOnceWith('submission-1');
    expect(fixture.nativeElement.textContent).toContain('123-45-6789');
    expect(fixture.nativeElement.textContent).toContain('Clears in 30s');

    tick(1000);
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain('Clears in 29s');

    tick(component.revealWindowMs - 1000);
    fixture.detectChanges();
  }));

  it('auto-clears the revealed SSN back to the masked value after 30 seconds', fakeAsync(() => {
    createComponentWithUser(adminUser);

    const button: HTMLButtonElement | null = fixture.nativeElement.querySelector('button');
    button?.click();
    fixture.detectChanges();

    expect(component.isSsnRevealed).toBeTrue();
    expect(component.displayedSsn).toBe('123-45-6789');

    tick(component.revealWindowMs);
    fixture.detectChanges();

    expect(component.isSsnRevealed).toBeFalse();
    expect(component.displayedSsn).toBe('***-**-6789');
    expect(fixture.nativeElement.textContent).not.toContain('123-45-6789');
    expect(fixture.nativeElement.textContent).not.toContain('Clears in');
  }));
});
