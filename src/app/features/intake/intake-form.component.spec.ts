import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { IntakeFormComponent } from './intake-form.component';
import { ApiService } from '../../core/services/api.service';

describe('IntakeFormComponent', () => {
  let fixture: ComponentFixture<IntakeFormComponent>;
  let component: IntakeFormComponent;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: jasmine.SpyObj<Router>;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['submitIntake']);
    apiService.submitIntake.and.returnValue(of({
      success: true,
      confirmation: {
        id: 'confirm-1',
        submittedAt: '2026-04-20T05:30:00.000Z',
        flaggedForManualReview: false,
      },
    }));

    await TestBed.configureTestingModule({
      imports: [IntakeFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(IntakeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('renders a compact TOC with stable section anchors', () => {
    const tocLinks = Array.from(fixture.nativeElement.querySelectorAll('.section-toc__link')) as HTMLAnchorElement[];

    expect(tocLinks.map((link) => link.getAttribute('href'))).toEqual([
      '#applicant-info',
      '#identity-check',
      '#attestation',
    ]);
    expect(fixture.nativeElement.querySelector('#applicant-info h2')?.textContent).toContain('Applicant information');
    expect(fixture.nativeElement.querySelector('#identity-check h2')?.textContent).toContain('Identity check');
    expect(fixture.nativeElement.querySelector('#attestation h2')?.textContent).toContain('Attestation');
  });

  it('renders the SSN field as password input with an explicit show/hide toggle', () => {
    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[name="ssn"]');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.toggle');

    expect(input.type).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('off');
    expect(toggle.textContent?.trim()).toBe('Show');
    expect(toggle.getAttribute('aria-label')).toBe('Show SSN');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggle.textContent?.trim()).toBe('Hide');
    expect(toggle.getAttribute('aria-label')).toBe('Hide SSN');
  });

  it('blocks submit and shows required-field errors when the public intake is incomplete', () => {
    component.form = {
      firstName: '',
      lastName: 'Lovelace',
      dateOfBirth: '',
      phone: '',
      email: 'not-an-email',
      ssn: '12',
      ageAttested: false,
    };

    component.onSubmit();
    fixture.detectChanges();

    expect(apiService.submitIntake).not.toHaveBeenCalled();
    expect(component.error).toBe('Please correct the required intake fields before submitting.');
    expect(component.errorDetails).toEqual([
      'First name is required.',
      'Date of birth is required.',
      'Phone is required.',
      'A valid email address is required.',
      'Enter a valid Social Security Number format.',
      'Age attestation is required.',
    ]);
  });

  it('clears SSN state and resets visibility after a successful submission', () => {
    component.form = {
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1815-12-10',
      phone: '555-111-2222',
      email: 'ada@example.com',
      ssn: '123-45-6789',
      ageAttested: true,
    };
    component.showSsn = true;

    component.onSubmit();

    expect(apiService.submitIntake).toHaveBeenCalledOnceWith({
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1815-12-10',
      phone: '555-111-2222',
      email: 'ada@example.com',
      ssn: '123-45-6789',
      ageAttested: true,
    });
    expect(component.form.ssn).toBe('');
    expect(component.showSsn).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/intake/confirmation'], {
      state: {
        confirmationId: 'confirm-1',
        submittedAt: '2026-04-20T05:30:00.000Z',
        flaggedForManualReview: false,
      },
    });
  });

  it('shows a generic message for submit failures without surfacing raw server details', () => {
    apiService.submitIntake.and.returnValue(throwError(() => ({
      status: 500,
      error: { error: 'stack trace with sensitive internals' },
    })));
    component.form = {
      firstName: 'Test',
      lastName: 'Applicant',
      dateOfBirth: '2000-01-01',
      phone: '555-0100',
      email: 'test.applicant@example.test',
      ssn: '',
      ageAttested: true,
    };

    component.onSubmit();

    expect(apiService.submitIntake).toHaveBeenCalledOnceWith({
      firstName: 'Test',
      lastName: 'Applicant',
      dateOfBirth: '2000-01-01',
      phone: '555-0100',
      email: 'test.applicant@example.test',
      ageAttested: true,
    });
    expect(component.error).toBe('We could not submit your intake form right now.');
  });

});
