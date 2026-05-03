import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

interface IntakeSubmissionPayload {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  ssn?: string;
  ageAttested: boolean;
}

type IntakeFieldKey = keyof IntakeSubmissionPayload;

interface IntakeSectionField {
  key: IntakeFieldKey;
  label: string;
  required?: boolean;
  validator?: (value: IntakeSubmissionPayload[IntakeFieldKey]) => boolean;
  errorMessage?: string;
}

interface IntakeSectionLink {
  id: string;
  title: string;
  sectionNumber: number;
  fields: IntakeSectionField[];
}

@Component({
  selector: 'app-intake-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="intake-page">
      <div class="intake-card">
        <a routerLink="/" class="back-link">← Back to home</a>
        <p class="eyebrow">Public Intake</p>
        <h1>Apply for housing support</h1>
        <p class="intro">
          Share your information securely so our team can review your housing support request.
        </p>

        <nav class="section-toc" aria-label="Form sections">
          <span class="section-toc__label">Jump to</span>
          <a *ngFor="let section of sectionLinks" [href]="'#' + section.id" class="section-toc__link">
            {{ section.title }}
          </a>
        </nav>

        <div *ngIf="error" class="alert alert-error" role="alert" aria-live="polite">
          <strong>{{ error }}</strong>
          <ul *ngIf="errorDetails.length" class="error-list">
            <li *ngFor="let detail of errorDetails">{{ detail }}</li>
          </ul>
        </div>

        <form #intakeForm="ngForm" (ngSubmit)="onSubmit(intakeForm)" novalidate>
          <section id="applicant-info" class="form-section-block">
            <div class="section-heading-row">
              <p class="section-kicker">Section 1</p>
              <h2>Applicant information</h2>
            </div>
            <div class="grid">
              <label>
                <span>First name</span>
                <input
                  type="text"
                  name="firstName"
                  [(ngModel)]="form.firstName"
                  required
                />
                <small *ngIf="shouldShowFieldError('firstName')" class="field-error">First name is required.</small>
              </label>

              <label>
                <span>Last name</span>
                <input
                  type="text"
                  name="lastName"
                  [(ngModel)]="form.lastName"
                  required
                />
                <small *ngIf="shouldShowFieldError('lastName')" class="field-error">Last name is required.</small>
              </label>

              <label>
                <span>Date of birth</span>
                <input
                  type="date"
                  name="dateOfBirth"
                  [(ngModel)]="form.dateOfBirth"
                  required
                />
                <small *ngIf="shouldShowFieldError('dateOfBirth')" class="field-error">Date of birth is required.</small>
              </label>

              <label>
                <span>Phone</span>
                <input
                  type="tel"
                  name="phone"
                  [(ngModel)]="form.phone"
                  required
                />
                <small *ngIf="shouldShowFieldError('phone')" class="field-error">Phone number is required.</small>
              </label>

              <label class="full-width">
                <span>Email</span>
                <input
                  type="email"
                  name="email"
                  [(ngModel)]="form.email"
                  required
                />
                <small *ngIf="shouldShowFieldError('email')" class="field-error">A valid email address is required.</small>
              </label>
            </div>
          </section>

          <section id="identity-check" class="form-section-block">
            <div class="section-heading-row">
              <p class="section-kicker">Section 2</p>
              <h2>Identity check</h2>
            </div>
            <label class="full-width">
              <span>Social Security Number</span>
              <div class="ssn-field">
                <input
                  [type]="showSsn ? 'text' : 'password'"
                  name="ssn"
                  [(ngModel)]="form.ssn"
                  autocomplete="off"
                  placeholder="XXX-XX-XXXX"
                  inputmode="numeric"
                  pattern="^\\d{3}-?\\d{2}-?\\d{4}$"
                  #ssnModel="ngModel"
                />
                <button
                  type="button"
                  class="toggle"
                  [attr.aria-label]="showSsn ? 'Hide SSN' : 'Show SSN'"
                  (click)="toggleSsnVisibility()"
                >
                  {{ showSsn ? 'Hide' : 'Show' }}
                </button>
              </div>
              <small class="hint">Optional. Enter digits only or use XXX-XX-XXXX format.</small>
              <small *ngIf="shouldShowFieldError('ssn')" class="field-error">
                Enter a valid Social Security Number format.
              </small>
            </label>
          </section>

          <section id="attestation" class="form-section-block form-section-block--compact">
            <div class="section-heading-row">
              <p class="section-kicker">Section 3</p>
              <h2>Attestation</h2>
            </div>
            <label class="checkbox-row">
              <input
                type="checkbox"
                name="ageAttested"
                [(ngModel)]="form.ageAttested"
                required
              />
              <span>I confirm that I am 18 or older.</span>
            </label>
          </section>

          <button type="submit" class="submit" [disabled]="submitting || !isReadyToSubmit()">
            {{ submitting ? 'Submitting...' : 'Submit intake form' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; min-height: 100vh; background: linear-gradient(180deg, #f8f6f1, #eef3f2); }
    * { box-sizing: border-box; }
    .intake-page { padding: 2rem 1rem; display: flex; justify-content: center; }
    .intake-card {
      width: min(100%, 760px);
      background: rgba(255, 255, 255, 0.96);
      border-radius: 28px;
      box-shadow: 0 22px 52px rgba(15, 40, 84, 0.14);
      padding: 2rem;
    }
    .back-link { color: #2f6f73; text-decoration: none; font-weight: 600; }
    .eyebrow { margin: 1rem 0 .5rem; text-transform: uppercase; letter-spacing: .12em; font-size: .75rem; color: #9a6b34; font-weight: 700; }
    h1 { margin: 0 0 .75rem; color: #0f2854; font-family: Georgia, 'Times New Roman', serif; }
    .intro { color: #5a6672; margin-bottom: 1.25rem; }
    .section-toc {
      display: flex;
      flex-wrap: wrap;
      gap: .5rem;
      margin-bottom: 1.25rem;
      padding: .85rem 1rem;
      border-radius: 16px;
      background: #f7faf9;
    }
    .section-toc__label, .section-kicker {
      color: #5a6672;
      font-size: .8rem;
      font-weight: 700;
    }
    .section-toc__link {
      color: #0f2854;
      text-decoration: none;
      font-size: .9rem;
      font-weight: 600;
    }
    .form-section-block { margin-bottom: 1.5rem; scroll-margin-top: 1rem; }
    .section-heading-row { margin-bottom: .85rem; }
    .section-kicker { margin: 0 0 .25rem; text-transform: uppercase; }
    .section-heading-row h2 { margin: 0; color: #0f2854; font-size: 1.1rem; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    label { display: flex; flex-direction: column; gap: .4rem; color: #2c2f33; font-weight: 600; }
    .full-width { grid-column: 1 / -1; }
    input {
      width: 100%;
      padding: .9rem 1rem;
      border: 1px solid #d8cbbf;
      border-radius: 14px;
      font-size: 1rem;
      background: #fffdfb;
      color: #2f241d;
    }
    input:focus { outline: none; border-color: #2f6f73; box-shadow: 0 0 0 4px rgba(47, 111, 115, 0.12); }
    .ssn-field { display: flex; gap: .75rem; align-items: center; }
    .toggle {
      border: 1px solid rgba(15, 40, 84, 0.14);
      background: #fff;
      color: #0f2854;
      border-radius: 999px;
      padding: .75rem 1rem;
      cursor: pointer;
      font-weight: 700;
      white-space: nowrap;
    }
    .hint { color: #66717b; font-weight: 400; }
    .field-error, .alert-error { color: #a12626; }
    .error-list { margin: .75rem 0 0 1rem; display: grid; gap: .35rem; }
    .checkbox-row {
      margin: 1.5rem 0;
      display: flex;
      flex-direction: row;
      align-items: center;
      gap: .75rem;
      font-weight: 500;
    }
    .checkbox-row input { width: auto; }
    .submit {
      width: 100%;
      border: none;
      border-radius: 999px;
      padding: 1rem 1.2rem;
      background: linear-gradient(135deg, #4f7e81, #2f6f73);
      color: #fff;
      font-weight: 700;
      cursor: pointer;
    }
    .submit:disabled { opacity: .65; cursor: not-allowed; }
    .alert {
      margin-bottom: 1rem;
      padding: .95rem 1rem;
      border: 1px solid #f2c1be;
      border-radius: 14px;
      background: #fff1f0;
    }
    @media (max-width: 700px) {
      .intake-card { padding: 1.25rem; border-radius: 20px; }
      .section-toc { overflow-x: auto; flex-wrap: nowrap; padding: .75rem; }
      .section-toc__label, .section-toc__link { flex: 0 0 auto; }
      .grid { grid-template-columns: 1fr; }
      .ssn-field { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class IntakeFormComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly sectionLinks: IntakeSectionLink[] = [
    {
      id: 'applicant-info',
      title: 'Applicant info',
      sectionNumber: 1,
      fields: [
        { key: 'firstName', label: 'First name', required: true },
        { key: 'lastName', label: 'Last name', required: true },
        { key: 'dateOfBirth', label: 'Date of birth', required: true },
        { key: 'phone', label: 'Phone', required: true },
        {
          key: 'email',
          label: 'Email',
          required: true,
          validator: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value || '').trim()),
          errorMessage: 'A valid email address is required.',
        },
      ],
    },
    {
      id: 'identity-check',
      title: 'Identity check',
      sectionNumber: 2,
      fields: [
        {
          key: 'ssn',
          label: 'Social Security Number',
          validator: () => this.isSsnValid(),
          errorMessage: 'Enter a valid Social Security Number format.',
        },
      ],
    },
    {
      id: 'attestation',
      title: 'Attestation',
      sectionNumber: 3,
      fields: [
        { key: 'ageAttested', label: 'Age attestation', required: true, validator: (value) => value === true },
      ],
    },
  ];

  form: IntakeSubmissionPayload = this.createEmptyForm();
  showSsn = false;
  submitting = false;
  error = '';
  errorDetails: string[] = [];
  validationAttempted = false;

  ngOnDestroy(): void {
    this.showSsn = false;
  }

  toggleSsnVisibility(): void {
    this.showSsn = !this.showSsn;
  }

  isReadyToSubmit(): boolean {
    return this.getValidationErrors().length === 0;
  }

  shouldShowFieldError(fieldKey: IntakeFieldKey): boolean {
    return this.validationAttempted && this.getInvalidFieldKeys().has(fieldKey);
  }

  onSubmit(intakeForm?: NgForm): void {
    this.validationAttempted = true;
    const validationErrors = this.getValidationErrors();

    if (validationErrors.length > 0) {
      intakeForm?.control.markAllAsTouched();
      this.error = 'Please correct the required intake fields before submitting.';
      this.errorDetails = validationErrors;
      this.scrollToSection(this.getFirstInvalidSectionId());
      return;
    }

    this.submitting = true;
    this.error = '';
    this.errorDetails = [];

    const trimmedSsn = (this.form.ssn || '').trim();

    const payload: IntakeSubmissionPayload = {
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      dateOfBirth: this.form.dateOfBirth,
      phone: this.form.phone.trim(),
      email: this.form.email.trim(),
      ageAttested: true,
      ...(trimmedSsn ? { ssn: trimmedSsn } : {}),
    };

    this.api.submitIntake(payload).subscribe({
      next: (response) => {
        const confirmation = response?.confirmation || {};
        this.clearSensitiveState();
        this.validationAttempted = false;
        this.submitting = false;
        void this.router.navigate(['/intake/confirmation'], {
          state: {
            confirmationId: confirmation.id,
            submittedAt: confirmation.submittedAt,
            flaggedForManualReview: confirmation.flaggedForManualReview,
          },
        });
      },
      error: (err) => {
        this.submitting = false;
        this.error = this.getSubmitErrorMessage(err);
      },
    });
  }

  private getSubmitErrorMessage(err: { status?: number } | null | undefined): string {
    if (err?.status === 400) {
      return 'Please correct the required intake fields before submitting.';
    }

    return 'We could not submit your intake form right now.';
  }

  private isSsnValid(): boolean {
    const trimmedSsn = (this.form.ssn || '').trim();

    if (!trimmedSsn) {
      return true;
    }

    return /^\d{3}-?\d{2}-?\d{4}$/.test(trimmedSsn);
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];

    for (const section of this.sectionLinks) {
      for (const field of section.fields) {
        const rawValue = this.form[field.key];
        const stringValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const isBlank = typeof stringValue === 'string' ? stringValue.length === 0 : !stringValue;

        if (field.required && isBlank) {
          errors.push(`${field.label} is required.`);
          continue;
        }

        if (!isBlank && field.validator && !field.validator(rawValue)) {
          errors.push(field.errorMessage || `${field.label} is invalid.`);
        }
      }
    }

    return Array.from(new Set(errors));
  }

  private getInvalidFieldKeys(): Set<IntakeFieldKey> {
    const invalidFields = new Set<IntakeFieldKey>();

    for (const section of this.sectionLinks) {
      for (const field of section.fields) {
        const rawValue = this.form[field.key];
        const stringValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const isBlank = typeof stringValue === 'string' ? stringValue.length === 0 : !stringValue;

        if ((field.required && isBlank) || (!isBlank && field.validator && !field.validator(rawValue))) {
          invalidFields.add(field.key);
        }
      }
    }

    return invalidFields;
  }

  private getFirstInvalidSectionId(): string {
    const invalidFields = this.getInvalidFieldKeys();
    return this.sectionLinks.find((section) => section.fields.some((field) => invalidFields.has(field.key)))?.id || this.sectionLinks[0].id;
  }

  private scrollToSection(sectionId: string): void {
    if (typeof document === 'undefined') {
      return;
    }

    document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  private clearSensitiveState(): void {
    this.form = this.createEmptyForm();
    this.showSsn = false;
  }

  private createEmptyForm(): IntakeSubmissionPayload {
    return {
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      phone: '',
      email: '',
      ssn: '',
      ageAttested: false,
    };
  }
}
