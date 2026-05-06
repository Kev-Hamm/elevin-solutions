import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { provideRouter, Router } from '@angular/router';
import { IntakeFormComponent } from './intake-form.component';
import { ApiService } from '../../core/services/api.service';

describe('IntakeFormComponent', () => {
  let fixture: ComponentFixture<IntakeFormComponent>;
  let component: IntakeFormComponent;
  let apiService: jasmine.SpyObj<ApiService>;
  let router: Router;

  beforeEach(async () => {
    apiService = jasmine.createSpyObj<ApiService>('ApiService', ['submitIntake']);
    apiService.submitIntake.and.returnValue(of({
      success: true,
      confirmation: {
        id: 'confirm-1',
        submittedAt: '2026-04-20T05:30:00.000Z',
        flaggedForManualReview: true,
      },
    }));

    await TestBed.configureTestingModule({
      imports: [IntakeFormComponent],
      providers: [
        provideRouter([]),
        { provide: ApiService, useValue: apiService },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);
    spyOn(router, 'navigate').and.returnValue(Promise.resolve(true));

    fixture = TestBed.createComponent(IntakeFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  function fillValidFullForm(): void {
    component.form = {
      ...component.form,
      dateOfIntake: '2026-05-04',
      referralAgency: 'Community Partner',
      staffReceiving: 'Riley Staff',
      programLocation: 'Main House',
      ageAttested: true,
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1980-12-10',
      phone: '555-111-2222',
      email: 'ADA@EXAMPLE.COM ',
      ssn: '6789',
      gender: 'self_describe',
      genderSelfDescribe: 'Agender',
      emergencyContactName: 'Grace Hopper',
      emergencyContactPhone: '555-333-4444',
      emergencyContactRelationship: 'Friend',
      currentLivingSituationSelections: ['shelter_or_transitional_housing', 'unsheltered_outdoors'],
      currentLivingSituationOther: 'Vehicle some nights',
      referralSourceType: 'community_organization',
      agencyProgramName: 'Housing Help',
      referrerContactName: 'Case Worker',
      referrerContactPhone: '555-222-0101',
      referrerEmail: 'referrer@example.test',
      hasIncome: 'yes',
      incomeTypeSelections: ['ssi', 'employment'],
      monthlyIncome: '1200',
      disabilityAccommodations: 'Ground floor preferred',
      preferredRoomType: 'private',
      adlCapable: 'with_support',
      adlSupportNeeds: 'Medication reminders',
      homeHealthProvider: 'yes',
      homeHealthAgency: 'Support Agency',
      onParoleOrProbation: 'prefer_not_to_say',
      poContact: '',
      registeredSexOffender: 'no',
      participantInitials: 'AL',
      participantSignature: 'Ada Lovelace',
      participantSignatureDate: '2026-05-04',
      staffName: 'Riley Staff',
      staffSignature: 'Riley Staff',
      staffSignatureDate: '2026-05-04',
      programAgreement1: true,
      programAgreement2: true,
    };
  }

  it('does not render the temporary Jump to TOC and keeps all intake sections visible in scroll order', () => {
    component.form.ageAttested = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.section-toc')).toBeNull();
    expect(fixture.nativeElement.textContent).not.toContain('Jump to');

    const sectionHeadings = Array.from(fixture.nativeElement.querySelectorAll('.form-section-block h2') as NodeListOf<HTMLElement>).map((heading) => heading.textContent?.trim());

    expect(sectionHeadings).toEqual([
      'Administrative Info',
      'Participant Information',
      'Current Living Situation',
      'Referral Source',
      'Income Information',
      'Housing Preferences',
      'Independent Living Assessment',
      'Legal Background',
      'Program Agreement & Consent + Signatures',
      '🔒 Phase 2 — Case Management (Not collected at initial intake)',
    ]);
    expect(fixture.nativeElement.querySelector('#phase-2')?.textContent).toContain('Medical History / Medical Notes');
  });

  it('keeps participant fields hidden until 18+ attestation is checked', () => {
    expect(fixture.nativeElement.querySelector('input[name="firstName"]')).toBeNull();
    expect(fixture.nativeElement.textContent).toContain('This form is for adults 18 and older.');

    component.form.ageAttested = true;
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('input[name="firstName"]')).not.toBeNull();
  });

  it('renders the SSN field as password input with an explicit show/hide toggle and autofill hardening', () => {
    component.form.ageAttested = true;
    fixture.detectChanges();

    const input: HTMLInputElement = fixture.nativeElement.querySelector('input[name="ssn"]');
    const toggle: HTMLButtonElement = fixture.nativeElement.querySelector('.toggle');

    expect(input.type).toBe('password');
    expect(input.getAttribute('autocomplete')).toBe('new-password');
    expect(toggle.textContent?.trim()).toBe('Show');
    expect(toggle.getAttribute('aria-label')).toBe('Show SSN last 4');

    toggle.click();
    fixture.detectChanges();

    expect(input.type).toBe('text');
    expect(toggle.textContent?.trim()).toBe('Hide');
    expect(toggle.getAttribute('aria-label')).toBe('Hide SSN last 4');
  });

  function formatLocalDate(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  function yearsAgo(years: number, dayOffset = 0): string {
    const date = new Date();
    date.setFullYear(date.getFullYear() - years);
    date.setDate(date.getDate() + dayOffset);

    return formatLocalDate(date);
  }

  it('blocks submit and shows required-field errors when required intake fields are incomplete', () => {
    component.form = {
      ...component.form,
      ageAttested: true,
      firstName: '',
      lastName: 'Lovelace',
      dateOfBirth: '',
      phone: '',
      email: 'not-an-email',
      ssn: '12',
      programAgreement1: false,
      programAgreement2: false,
      participantInitials: '',
      participantSignature: '',
      participantSignatureDate: '',
    };

    component.onSubmit();

    expect(apiService.submitIntake).not.toHaveBeenCalled();
    expect(component.error).toBe('Please correct the required intake fields before submitting.');
    expect(component.errorDetails).toEqual([
      'First name is required.',
      'Date of birth is required.',
      'Phone is required.',
      'Enter a valid email address.',
      'Enter exactly the last 4 SSN digits.',
      'Program Agreement #1 is required.',
      'Program Agreement #2 is required.',
      'Participant initials are required.',
      'Participant signature is required.',
      'Participant signature date is required.',
    ]);
  });



  it('keeps submit disabled until required consent and participant signature fields are complete', () => {
    fillValidFullForm();
    component.form.programAgreement1 = false;
    fixture.detectChanges();

    const submitButton = () => fixture.nativeElement.querySelector('button[type="submit"]') as HTMLButtonElement;

    expect(component.isReadyToSubmit()).toBeFalse();
    expect(submitButton().disabled).toBeTrue();

    component.form.programAgreement1 = true;
    component.form.programAgreement2 = false;
    fixture.detectChanges();

    expect(component.isReadyToSubmit()).toBeFalse();
    expect(submitButton().disabled).toBeTrue();

    component.form.programAgreement2 = true;
    component.form.participantInitials = '';
    fixture.detectChanges();

    expect(component.isReadyToSubmit()).toBeFalse();
    expect(submitButton().disabled).toBeTrue();

    component.form.participantInitials = 'AL';
    component.form.participantSignature = '';
    fixture.detectChanges();

    expect(component.isReadyToSubmit()).toBeFalse();
    expect(submitButton().disabled).toBeTrue();

    component.form.participantSignature = 'Ada Lovelace';
    component.form.participantSignatureDate = '';
    fixture.detectChanges();

    expect(component.isReadyToSubmit()).toBeFalse();
    expect(submitButton().disabled).toBeTrue();

    component.form.participantSignatureDate = '2026-05-04';
    fixture.detectChanges();

    expect(component.isReadyToSubmit()).toBeTrue();
    expect(submitButton().disabled).toBeFalse();
  });

  it('blocks under-18 date of birth even when the age attestation checkbox is checked', () => {
    fillValidFullForm();
    component.form.dateOfBirth = yearsAgo(18, 1);

    expect(component.form.ageAttested).toBeTrue();
    expect(component.isReadyToSubmit()).toBeFalse();

    component.onSubmit();

    expect(apiService.submitIntake).not.toHaveBeenCalled();
    expect(component.errorDetails).toContain('This form is for adults 18 and older. Please speak with staff for assistance.');
  });

  it('allows an applicant whose date of birth is exactly 18 years ago today', () => {
    fillValidFullForm();
    component.form.dateOfBirth = yearsAgo(18);

    expect(component.isAtLeast18(component.form.dateOfBirth)).toBeTrue();
    expect(component.isReadyToSubmit()).toBeTrue();

    component.onSubmit();

    expect(apiService.submitIntake).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      dateOfBirth: yearsAgo(18),
    }));
  });

  it('validates touched phone, email, initials, and SSN formats with plain messages', () => {
    fillValidFullForm();
    component.form.phone = '12345';
    component.form.email = 'ada.example.com';
    component.form.ssn = '12ab';
    component.form.emergencyContactPhone = 'call Grace';
    component.form.referrerContactPhone = '555';
    component.form.referrerEmail = 'bad-referrer-email';
    component.form.participantInitials = 'A1';

    component.onSubmit();

    expect(apiService.submitIntake).not.toHaveBeenCalled();
    expect(component.errorDetails).toEqual(jasmine.arrayContaining([
      'Enter a valid phone number.',
      'Enter a valid email address.',
      'Enter exactly the last 4 SSN digits.',
      'Enter a valid emergency contact phone number.',
      'Enter a valid referrer phone number.',
      'Enter a valid referrer email address.',
      'Use 1–4 letters for participant initials.',
    ]));
  });

  it('submits the full-form payload shape, JSON string groups, and manual review flag', () => {
    fillValidFullForm();

    component.onSubmit();

    expect(apiService.submitIntake).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      dateOfIntake: '2026-05-04',
      referralAgency: 'Community Partner',
      staffReceiving: 'Riley Staff',
      programLocation: 'Main House',
      ageAttested: true,
      firstName: 'Ada',
      lastName: 'Lovelace',
      dateOfBirth: '1980-12-10',
      phone: '555-111-2222',
      email: 'ada@example.com',
      ssn: '6789',
      gender: 'self_describe',
      genderSelfDescribe: 'Agender',
      emergencyContactName: 'Grace Hopper',
      emergencyContactPhone: '555-333-4444',
      emergencyContactRelationship: 'Friend',
      currentLivingSituation: JSON.stringify(['shelter_or_transitional_housing', 'unsheltered_outdoors', 'other:Vehicle some nights']),
      referralSourceType: 'community_organization',
      agencyProgramName: 'Housing Help',
      referrerContactName: 'Case Worker',
      referrerContactPhone: '555-222-0101',
      referrerEmail: 'referrer@example.test',
      hasIncome: 'yes',
      incomeType: JSON.stringify(['ssi', 'employment']),
      monthlyIncome: '1200',
      disabilityAccommodations: 'Ground floor preferred',
      preferredRoomType: 'private',
      adlCapable: 'with_support',
      adlSupportNeeds: 'Medication reminders',
      homeHealthProvider: 'yes',
      homeHealthAgency: 'Support Agency',
      onParoleOrProbation: 'prefer_not_to_say',
      registeredSexOffender: 'no',
      flaggedForManualReview: true,
      programAgreement1: true,
      programAgreement2: true,
      participantInitials: 'AL',
      participantSignature: 'Ada Lovelace',
      participantSignatureDate: '2026-05-04',
      staffName: 'Riley Staff',
      staffSignature: 'Riley Staff',
      staffSignatureDate: '2026-05-04',
    }));
    expect(component.form.ssn).toBe('');
    expect(component.showSsn).toBeFalse();
    expect(router.navigate).toHaveBeenCalledOnceWith(['/intake/confirmation'], {
      state: {
        confirmationId: 'confirm-1',
        submittedAt: '2026-04-20T05:30:00.000Z',
        flaggedForManualReview: true,
      },
    });
  });

  it('does not set manual review when legal questions are definitive no values', () => {
    fillValidFullForm();
    component.form.ssn = '';
    component.form.onParoleOrProbation = 'no';
    component.form.registeredSexOffender = 'no';

    component.onSubmit();

    expect(apiService.submitIntake).toHaveBeenCalledOnceWith(jasmine.objectContaining({
      flaggedForManualReview: false,
      onParoleOrProbation: 'no',
      registeredSexOffender: 'no',
    }));
    const payload = apiService.submitIntake.calls.mostRecent().args[0];
    expect(payload.ssn).toBeUndefined();
  });

  it('shows a generic message for submit failures without surfacing raw server details', () => {
    apiService.submitIntake.and.returnValue(throwError(() => ({
      status: 500,
      error: { error: 'stack trace with sensitive internals' },
    })));
    fillValidFullForm();

    component.onSubmit();

    expect(component.error).toBe('We could not submit your intake form right now.');
  });
});
