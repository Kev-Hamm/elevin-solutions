import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
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

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <form #intakeForm="ngForm" (ngSubmit)="onSubmit()" novalidate>
          <div class="grid">
            <label>
              <span>First name</span>
              <input
                type="text"
                name="firstName"
                [(ngModel)]="form.firstName"
                required
              />
            </label>

            <label>
              <span>Last name</span>
              <input
                type="text"
                name="lastName"
                [(ngModel)]="form.lastName"
                required
              />
            </label>

            <label>
              <span>Date of birth</span>
              <input
                type="date"
                name="dateOfBirth"
                [(ngModel)]="form.dateOfBirth"
                required
              />
            </label>

            <label>
              <span>Phone</span>
              <input
                type="tel"
                name="phone"
                [(ngModel)]="form.phone"
                required
              />
            </label>

            <label class="full-width">
              <span>Email</span>
              <input
                type="email"
                name="email"
                [(ngModel)]="form.email"
                required
              />
            </label>

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
              <small *ngIf="ssnModel.invalid && ssnModel.touched && form.ssn" class="field-error">
                Enter a valid Social Security Number format.
              </small>
            </label>
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
    .intro { color: #5a6672; margin-bottom: 1.5rem; }
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
      .grid { grid-template-columns: 1fr; }
      .ssn-field { flex-direction: column; align-items: stretch; }
    }
  `],
})
export class IntakeFormComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  form: IntakeSubmissionPayload = this.createEmptyForm();
  showSsn = false;
  submitting = false;
  error = '';

  ngOnDestroy(): void {
    this.showSsn = false;
  }

  toggleSsnVisibility(): void {
    this.showSsn = !this.showSsn;
  }

  isReadyToSubmit(): boolean {
    return !!(
      this.form.firstName.trim() &&
      this.form.lastName.trim() &&
      this.form.dateOfBirth &&
      this.form.phone.trim() &&
      this.form.email.trim() &&
      this.form.ageAttested &&
      this.isSsnValid()
    );
  }

  onSubmit(): void {
    if (!this.isReadyToSubmit()) {
      this.error = 'Please complete the required fields before submitting.';
      return;
    }

    this.submitting = true;
    this.error = '';

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
        this.error = err.error?.error || 'We could not submit your intake form right now.';
      },
    });
  }

  private isSsnValid(): boolean {
    const trimmedSsn = (this.form.ssn || '').trim();

    if (!trimmedSsn) {
      return true;
    }

    return /^\d{3}-?\d{2}-?\d{4}$/.test(trimmedSsn);
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
