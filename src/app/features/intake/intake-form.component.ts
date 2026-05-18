import { CommonModule } from '@angular/common';
import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule, NgForm } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService, IntakeSubmissionRequest } from '../../core/services/api.service';

type LegalResponse = '' | 'yes' | 'no' | 'prefer_not_to_say';

type IntakeFormState = IntakeSubmissionRequest & {
  genderSelfDescribe: string;
  currentLivingSituationSelections: string[];
  currentLivingSituationOther: string;
  incomeTypeSelections: string[];
  onParoleOrProbation: LegalResponse;
  registeredSexOffender: LegalResponse;
};

type IntakeFieldKey = keyof IntakeFormState;

interface IntakeSectionField {
  key: IntakeFieldKey;
  label: string;
  required?: boolean;
  validator?: () => boolean;
  requiredMessage?: string;
  errorMessage?: string | (() => string);
}

interface IntakeSectionLink {
  id: string;
  title: string;
  sectionNumber: number;
  fields: IntakeSectionField[];
}

interface Choice {
  value: string;
  label: string;
}

@Component({
  selector: 'app-intake-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="intake-page">
      <div class="intake-card">
        <header class="hero">
          <a routerLink="/" class="back-link">← Back to home</a>
          <p class="eyebrow">Public Intake</p>
          <h1>Supportive Housing Client Intake</h1>
          <p class="intro">This is the full initial intake form. Fields marked with * are required for submission.</p>
        </header>

        <div *ngIf="error" class="alert alert-error" role="alert" aria-live="polite">
          <strong>{{ error }}</strong>
          <ul *ngIf="errorDetails.length" class="error-list">
            <li *ngFor="let detail of errorDetails">{{ detail }}</li>
          </ul>
        </div>

        <form #intakeForm="ngForm" (ngSubmit)="onSubmit(intakeForm)" novalidate autocomplete="off">
          <section id="administrative-info" class="form-section-block staff-band">
            <div class="section-heading-row">
              <p class="section-kicker">Section 1</p>
              <h2>Administrative Info</h2>
              <p class="section-note">Staff use only. This information helps route the intake internally.</p>
            </div>
            <div class="grid">
              <label><span>Date of intake</span><input type="date" name="dateOfIntake" [(ngModel)]="form.dateOfIntake" /></label>
              <label><span>Referral agency / referrer name</span><input type="text" name="referralAgency" [(ngModel)]="form.referralAgency" /></label>
              <label><span>Staff receiving intake</span><input type="text" name="staffReceiving" [(ngModel)]="form.staffReceiving" /></label>
              <label><span>Program / location</span><input type="text" name="programLocation" [(ngModel)]="form.programLocation" /></label>
            </div>
          </section>

          <section id="participant-info" class="form-section-block">
            <div class="section-heading-row">
              <p class="section-kicker">Section 2</p>
              <h2>Participant Information</h2>
            </div>

            <label class="checkbox-row age-gate">
              <input type="checkbox" name="ageAttested" [(ngModel)]="form.ageAttested" required />
              <span>I confirm I am 18 years of age or older. *</span>
            </label>
            <small *ngIf="shouldShowFieldError('ageAttested')" class="field-error">Age attestation is required.</small>

            <div *ngIf="!form.ageAttested" class="notice" role="status">
              <strong>This form is for adults 18 and older.</strong>
              <p>Please speak with a staff member directly for assistance. No participant information is collected until this attestation is checked.</p>
            </div>

            <ng-container *ngIf="form.ageAttested">
              <div class="grid">
                <label><span>First name *</span><input type="text" name="firstName" [(ngModel)]="form.firstName" autocomplete="given-name" required /><small *ngIf="shouldShowFieldError('firstName')" class="field-error">First name is required.</small></label>
                <label><span>Last name *</span><input type="text" name="lastName" [(ngModel)]="form.lastName" autocomplete="family-name" required /><small *ngIf="shouldShowFieldError('lastName')" class="field-error">Last name is required.</small></label>
                <label><span>Date of birth *</span><input type="date" name="dateOfBirth" [(ngModel)]="form.dateOfBirth" required /><small *ngIf="shouldShowFieldError('dateOfBirth')" class="field-error">{{ getFieldErrorMessage('dateOfBirth') }}</small></label>
                <label><span>Phone *</span><input type="tel" name="phone" [(ngModel)]="form.phone" autocomplete="tel" required /><small *ngIf="shouldShowFieldError('phone')" class="field-error">{{ getFieldErrorMessage('phone') }}</small></label>
                <label><span>Email *</span><input type="email" name="email" [(ngModel)]="form.email" autocomplete="email" required /><small *ngIf="shouldShowFieldError('email')" class="field-error">{{ getFieldErrorMessage('email') }}</small></label>
                <label><span>Gender identity</span><select name="gender" [(ngModel)]="form.gender"><option value="">Select one</option><option value="male">Male</option><option value="female">Female</option><option value="non_binary">Non-binary</option><option value="prefer_not_to_say">Prefer not to say</option><option value="self_describe">Self-describe</option></select></label>
                <label *ngIf="form.gender === 'self_describe'" class="full-width"><span>Self-describe</span><input type="text" name="genderSelfDescribe" [(ngModel)]="form.genderSelfDescribe" autocomplete="off" /></label>
                <label class="full-width"><span>Social Security Number last 4 digits <em>(optional)</em></span><span class="ssn-field"><input [type]="showSsn ? 'text' : 'password'" name="ssn" [(ngModel)]="form.ssn" autocomplete="new-password" placeholder="1234" inputmode="numeric" maxlength="4" pattern="^\\d{4}$" /><button type="button" class="toggle" [attr.aria-label]="showSsn ? 'Hide SSN last 4' : 'Show SSN last 4'" (click)="toggleSsnVisibility()">{{ showSsn ? 'Hide' : 'Show' }}</button></span><small class="hint">We collect only the last 4 digits of SSN to help verify identity and coordinate benefits. This is optional.</small><small *ngIf="shouldShowFieldError('ssn')" class="field-error">Enter exactly the last 4 SSN digits.</small></label>
              </div>

              <div class="subcard">
                <h3>Emergency Contact</h3>
                <p class="section-note">Your emergency contact's information is collected to reach them in a medical or safety emergency. By providing it, you confirm they have agreed to be contacted on your behalf.</p>
                <div class="grid">
                  <label><span>Emergency contact name</span><input type="text" name="emergencyContactName" [(ngModel)]="form.emergencyContactName" autocomplete="off" /></label>
                  <label><span>Emergency contact phone</span><input type="tel" name="emergencyContactPhone" [(ngModel)]="form.emergencyContactPhone" autocomplete="off" /><small *ngIf="shouldShowFieldError('emergencyContactPhone')" class="field-error">{{ getFieldErrorMessage('emergencyContactPhone') }}</small></label>
                  <label class="full-width"><span>Relationship</span><input type="text" name="emergencyContactRelationship" [(ngModel)]="form.emergencyContactRelationship" autocomplete="off" /></label>
                </div>
              </div>
            </ng-container>
          </section>

          <ng-container *ngIf="form.ageAttested">
            <section id="current-living-situation" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 3</p><h2>Current Living Situation</h2></div>
              <div class="choice-grid">
                <label *ngFor="let option of livingSituationOptions" class="checkbox-row"><input type="checkbox" [name]="'living-' + option.value" [checked]="isChecked(form.currentLivingSituationSelections, option.value)" (change)="toggleSelection(form.currentLivingSituationSelections, option.value, $event)" /><span>{{ option.label }}</span></label>
              </div>
              <label class="full-width"><span>Other living situation</span><input type="text" name="currentLivingSituationOther" [(ngModel)]="form.currentLivingSituationOther" /></label>
            </section>

            <section id="referral-source" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 4</p><h2>Referral Source</h2></div>
              <div class="grid">
                <label><span>Referral source type</span><select name="referralSourceType" [(ngModel)]="form.referralSourceType"><option value="">Select one</option><option value="self_referral">Self-referral</option><option value="community_organization">Community organization</option><option value="healthcare_provider">Healthcare provider</option><option value="legal">Legal</option><option value="government_agency">Government agency</option><option value="other">Other</option></select></label>
                <label><span>Agency / program name</span><input type="text" name="agencyProgramName" [(ngModel)]="form.agencyProgramName" /></label>
                <label><span>Referring contact name</span><input type="text" name="referrerContactName" [(ngModel)]="form.referrerContactName" autocomplete="off" /></label>
                <label><span>Referrer phone</span><input type="tel" name="referrerContactPhone" [(ngModel)]="form.referrerContactPhone" autocomplete="off" /><small *ngIf="shouldShowFieldError('referrerContactPhone')" class="field-error">{{ getFieldErrorMessage('referrerContactPhone') }}</small></label>
                <label class="full-width"><span>Referrer email</span><input type="email" name="referrerEmail" [(ngModel)]="form.referrerEmail" autocomplete="off" /><small *ngIf="shouldShowFieldError('referrerEmail')" class="field-error">{{ getFieldErrorMessage('referrerEmail') }}</small></label>
              </div>
            </section>

            <section id="income-information" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 5</p><h2>Income Information</h2></div>
              <p class="section-note">Information about disability or accommodation needs is collected only to provide appropriate housing and support services.</p>
              <div class="grid">
                <label><span>Do you currently have income?</span><select name="hasIncome" [(ngModel)]="form.hasIncome"><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
                <label><span>Monthly income amount</span><input type="text" name="monthlyIncome" [(ngModel)]="form.monthlyIncome" inputmode="decimal" /></label>
              </div>
              <div class="choice-grid" [class.muted]="form.hasIncome === 'no'">
                <label *ngFor="let option of incomeTypeOptions" class="checkbox-row"><input type="checkbox" [name]="'income-' + option.value" [checked]="isChecked(form.incomeTypeSelections, option.value)" (change)="toggleSelection(form.incomeTypeSelections, option.value, $event)" /><span>{{ option.label }}</span></label>
              </div>
              <label class="full-width"><span>Disabilities / accommodations needed</span><textarea name="disabilityAccommodations" [(ngModel)]="form.disabilityAccommodations" maxlength="500"></textarea></label>
            </section>

            <section id="housing-preferences" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 6</p><h2>Housing Preferences</h2></div>
              <div class="choice-grid"><label *ngFor="let option of roomTypeOptions" class="radio-row"><input type="radio" name="preferredRoomType" [(ngModel)]="form.preferredRoomType" [value]="option.value" /><span>{{ option.label }}</span></label></div>
            </section>

            <section id="independent-living-assessment" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 7</p><h2>Independent Living Assessment</h2></div>
              <p class="section-note">Daily activities include cooking, bathing, managing medications, and getting around.</p>
              <div class="grid">
                <label><span>Can you manage daily activities independently?</span><select name="adlCapable" [(ngModel)]="form.adlCapable"><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option><option value="sometimes">Sometimes</option><option value="with_support">With support</option></select></label>
                <label><span>Do you have a home health provider?</span><select name="homeHealthProvider" [(ngModel)]="form.homeHealthProvider"><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option></select></label>
                <label class="full-width"><span>If not fully, describe support needs</span><textarea name="adlSupportNeeds" [(ngModel)]="form.adlSupportNeeds" maxlength="500"></textarea></label>
                <label class="full-width"><span>If yes, agency/provider name</span><input type="text" name="homeHealthAgency" [(ngModel)]="form.homeHealthAgency" /></label>
              </div>
            </section>

            <section id="legal-background" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 8</p><h2>Legal Background</h2></div>
              <p class="section-note">The following questions help us match you with appropriate housing options and meet program requirements. Your responses are kept confidential and are not reported to law enforcement.</p>
              <div class="grid">
                <label><span>Are you currently on parole or probation?</span><select name="onParoleOrProbation" [(ngModel)]="form.onParoleOrProbation"><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
                <label><span>Are you a registered sex offender?</span><select name="registeredSexOffender" [(ngModel)]="form.registeredSexOffender"><option value="">Select one</option><option value="yes">Yes</option><option value="no">No</option><option value="prefer_not_to_say">Prefer not to say</option></select></label>
                <label *ngIf="form.onParoleOrProbation === 'yes'" class="full-width"><span>Parole/probation officer name and phone</span><input type="text" name="poContact" [(ngModel)]="form.poContact" autocomplete="off" /></label>
              </div>
              <p *ngIf="isManualReviewNeeded()" class="manual-review">Prefer not to say responses are accepted and will flag this intake for staff manual review.</p>
            </section>

            <section id="program-agreement-consent" class="form-section-block">
              <div class="section-heading-row"><p class="section-kicker">Section 9</p><h2>Program Agreement & Consent + Signatures</h2></div>
              <div class="consent-block">
                <h3>Your Privacy — What We Collect and Why</h3>
                <p>Elevin Solutions collects information to connect you with housing and support services. Personal information, living situation, income, disability, legal background, emergency contact details, and signatures are used for intake review and service coordination. We do not sell your data or share it without written consent except as required by law.</p>
              </div>
              <label class="checkbox-row"><input type="checkbox" name="programAgreement1" [(ngModel)]="form.programAgreement1" /><span>I understand the program rules and agree to participate respectfully. *</span></label>
              <small *ngIf="shouldShowFieldError('programAgreement1')" class="field-error">Program Agreement #1 is required.</small>
              <label class="checkbox-row"><input type="checkbox" name="programAgreement2" [(ngModel)]="form.programAgreement2" /><span>I consent to the collection and use of my information for intake review and housing support. *</span></label>
              <small *ngIf="shouldShowFieldError('programAgreement2')" class="field-error">Program Agreement #2 is required.</small>
              <div class="grid">
                <label><span>Participant initials *</span><input type="text" name="participantInitials" [(ngModel)]="form.participantInitials" maxlength="4" autocomplete="off" /><small *ngIf="shouldShowFieldError('participantInitials')" class="field-error">{{ getFieldErrorMessage('participantInitials') }}</small></label>
                <label><span>Participant signature date *</span><input type="date" name="participantSignatureDate" [(ngModel)]="form.participantSignatureDate" /><small *ngIf="shouldShowFieldError('participantSignatureDate')" class="field-error">{{ getFieldErrorMessage('participantSignatureDate') }}</small></label>
                <label class="full-width"><span>Participant signature — typed legal name *</span><input type="text" name="participantSignature" [(ngModel)]="form.participantSignature" autocomplete="off" /><small class="hint">By typing my name above, I confirm this constitutes my legal signature.</small><small *ngIf="shouldShowFieldError('participantSignature')" class="field-error">Participant signature is required.</small></label>
                <label><span>Staff name</span><input type="text" name="staffName" [(ngModel)]="form.staffName" autocomplete="off" /></label>
                <label><span>Staff signature date</span><input type="date" name="staffSignatureDate" [(ngModel)]="form.staffSignatureDate" /></label>
                <label class="full-width"><span>Staff signature — typed name</span><input type="text" name="staffSignature" [(ngModel)]="form.staffSignature" autocomplete="off" /></label>
              </div>
            </section>

            <section id="phase-2" class="form-section-block locked-block" aria-label="Locked Phase 2 case management fields">
              <div class="section-heading-row"><p class="section-kicker">Locked</p><h2>🔒 Phase 2 — Case Management (Not collected at initial intake)</h2></div>
              <p>The following information will be collected by your case manager in a follow-up appointment. It is not required today.</p>
              <div class="grid">
                <label><span>Brief Summary / Reason for Need</span><input type="text" disabled value="Not collected at initial intake" /></label>
                <label><span>Medical History / Medical Notes</span><input type="text" disabled value="Not collected at initial intake" /></label>
                <label><span>Mental Health / Behavioral Health</span><input type="text" disabled value="Not collected at initial intake" /></label>
                <label><span>Substance Use History</span><input type="text" disabled value="Not collected at initial intake" /></label>
              </div>
            </section>
          </ng-container>

          <button type="submit" class="submit" [disabled]="submitting || !isReadyToSubmit()">
            {{ submitting ? 'Submitting...' : 'Submit intake form' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    :host{display:block;min-height:100vh;background:linear-gradient(180deg,#f8f6f1,#eef3f2)}*{box-sizing:border-box}.intake-page{padding:2rem 1rem;display:flex;justify-content:center}.intake-card{width:min(100%,920px);background:#fff;border-radius:24px;box-shadow:0 18px 44px rgba(15,40,84,.14);padding:1.5rem}.back-link{color:#2f6f73;font-weight:700;text-decoration:none}.eyebrow,.section-kicker{margin:.7rem 0 .35rem;text-transform:uppercase;letter-spacing:.12em;font-size:.75rem;color:#9a6b34;font-weight:800}h1,h2,h3{margin:.15rem 0 .5rem;color:#0f2854}.intro,.section-note,.hint,.notice p,.locked-block p{color:#5d6873;line-height:1.5}.form-section-block{margin:1rem 0;padding:1rem;border:1px solid #e6ddd4;border-radius:18px;background:#fffdfb;scroll-margin-top:4.5rem}.staff-band,.locked-block{background:#f4f5f3}.subcard,.consent-block,.notice{margin-top:1rem;padding:1rem;border-radius:16px;background:#f7faf9;border:1px solid #dce9e5}.grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.9rem}.choice-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.5rem;margin:.5rem 0 1rem}.full-width{grid-column:1/-1}label{display:flex;flex-direction:column;gap:.35rem;font-weight:700;color:#2c2f33}input,select,textarea{width:100%;min-height:44px;padding:.75rem .85rem;border:1px solid #d5c8bc;border-radius:12px;background:#fff;color:#2f241d;font-size:1rem}textarea{min-height:110px;resize:vertical}input:focus,select:focus,textarea:focus{outline:3px solid rgba(47,111,115,.16);border-color:#2f6f73}.checkbox-row,.radio-row{flex-direction:row;align-items:flex-start;gap:.6rem;font-weight:600}.checkbox-row input,.radio-row input{width:auto;min-height:auto;margin-top:.2rem}.ssn-field{display:flex;gap:.6rem}.toggle{border:1px solid #cdd8d6;background:#fff;color:#0f2854;border-radius:999px;padding:.65rem .9rem;font-weight:800;cursor:pointer}.field-error,.alert-error{color:#a12626}.alert{margin:1rem 0;padding:.9rem;border:1px solid #f2c1be;border-radius:14px;background:#fff1f0}.error-list{margin:.6rem 0 0 1rem}.manual-review{padding:.75rem;border-radius:12px;background:#fff7df;color:#6b4b00;font-weight:700}.muted{opacity:.6}.submit{width:100%;border:0;border-radius:999px;padding:1rem 1.2rem;background:linear-gradient(135deg,#4f7e81,#2f6f73);color:#fff;font-weight:800;cursor:pointer}.submit:disabled{opacity:.65;cursor:not-allowed}@media(max-width:720px){.intake-page{padding:1rem .6rem}.intake-card{padding:1rem;border-radius:18px}.grid,.choice-grid{grid-template-columns:1fr}.ssn-field{flex-direction:column}.form-section-block{padding:.85rem}}
  `],
})
export class IntakeFormComponent implements OnDestroy {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  readonly livingSituationOptions: Choice[] = [
    { value: 'shelter_or_transitional_housing', label: 'Staying in a shelter or transitional housing' },
    { value: 'temporary_family_or_friends', label: 'Staying with family or friends temporarily' },
    { value: 'hotel_or_motel', label: 'Staying in a hotel or motel' },
    { value: 'unsheltered_outdoors', label: 'Unsheltered / outdoors' },
    { value: 'releasing_from_corrections', label: 'Releasing from jail, prison, or detention' },
    { value: 'releasing_from_hospital_or_rehab', label: 'Releasing from hospital or rehabilitation facility' },
    { value: 'currently_housed_seeking_services', label: 'Currently housed and seeking services' },
  ];

  readonly incomeTypeOptions: Choice[] = [
    { value: 'ssi', label: 'SSI' },
    { value: 'ssdi', label: 'SSDI' },
    { value: 'employment', label: 'Employment' },
    { value: 'self_employment', label: 'Self-employment' },
    { value: 'other', label: 'Other' },
  ];

  readonly roomTypeOptions: Choice[] = [
    { value: 'shared', label: 'Shared' },
    { value: 'private', label: 'Private' },
    { value: 'no_preference', label: 'No preference' },
  ];

  readonly sectionLinks: IntakeSectionLink[] = [
    { id: 'administrative-info', title: 'Administrative Info', sectionNumber: 1, fields: [] },
    {
      id: 'participant-info',
      title: 'Participant Information',
      sectionNumber: 2,
      fields: [
        { key: 'ageAttested', label: 'Age attestation', required: true, validator: () => this.form.ageAttested === true, requiredMessage: 'Age attestation is required.' },
        { key: 'firstName', label: 'First name', required: true },
        { key: 'lastName', label: 'Last name', required: true },
        { key: 'dateOfBirth', label: 'Date of birth', required: true, validator: () => this.isAdultDateOfBirth(), errorMessage: () => this.getDateOfBirthErrorMessage() },
        { key: 'phone', label: 'Phone', required: true, validator: () => this.isPhoneValid(this.form.phone), errorMessage: 'Enter a valid phone number.' },
        { key: 'email', label: 'Email', required: true, validator: () => this.isEmailValid(this.form.email), errorMessage: 'Enter a valid email address.' },
        { key: 'ssn', label: 'Social Security Number last 4 digits', validator: () => this.isSsnValid(), errorMessage: 'Enter exactly the last 4 SSN digits.' },
        { key: 'emergencyContactPhone', label: 'Emergency contact phone', validator: () => this.isPhoneValid(this.form.emergencyContactPhone), errorMessage: 'Enter a valid emergency contact phone number.' },
      ],
    },
    { id: 'current-living-situation', title: 'Current Living Situation', sectionNumber: 3, fields: [] },
    {
      id: 'referral-source',
      title: 'Referral Source',
      sectionNumber: 4,
      fields: [
        { key: 'referrerContactPhone', label: 'Referrer phone', validator: () => this.isPhoneValid(this.form.referrerContactPhone), errorMessage: 'Enter a valid referrer phone number.' },
        { key: 'referrerEmail', label: 'Referrer email', validator: () => this.isEmailValid(this.form.referrerEmail), errorMessage: 'Enter a valid referrer email address.' },
      ],
    },
    { id: 'income-information', title: 'Income Information', sectionNumber: 5, fields: [] },
    { id: 'housing-preferences', title: 'Housing Preferences', sectionNumber: 6, fields: [] },
    { id: 'independent-living-assessment', title: 'Independent Living Assessment', sectionNumber: 7, fields: [] },
    { id: 'legal-background', title: 'Legal Background', sectionNumber: 8, fields: [] },
    {
      id: 'program-agreement-consent',
      title: 'Program Agreement & Consent',
      sectionNumber: 9,
      fields: [
        { key: 'programAgreement1', label: 'Program Agreement #1', required: true, validator: () => this.form.programAgreement1 === true, requiredMessage: 'Program Agreement #1 is required.' },
        { key: 'programAgreement2', label: 'Program Agreement #2', required: true, validator: () => this.form.programAgreement2 === true, requiredMessage: 'Program Agreement #2 is required.' },
        { key: 'participantInitials', label: 'Participant initials', required: true, validator: () => this.isInitialsValid(), requiredMessage: 'Participant initials are required.', errorMessage: 'Use 1–4 letters for participant initials.' },
        { key: 'participantSignature', label: 'Participant signature', required: true },
        { key: 'participantSignatureDate', label: 'Participant signature date', required: true, validator: () => this.isValidIsoDate(this.form.participantSignatureDate), requiredMessage: 'Participant signature date is required.', errorMessage: 'Enter a valid participant signature date.' },
      ],
    },
  ];

  form: IntakeFormState = this.createEmptyForm();
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

  getFieldErrorMessage(fieldKey: IntakeFieldKey): string {
    const field = this.sectionLinks.flatMap((section) => section.fields).find((candidate) => candidate.key === fieldKey);

    if (!field) {
      return 'Please check this field.';
    }

    return this.getInvalidFieldMessage(field);
  }

  isAtLeast18(dateOfBirth: string): boolean {
    const parsedDate = this.parseIsoDate(dateOfBirth);

    if (!parsedDate) {
      return false;
    }

    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth() + 1;
    const todayDay = today.getDate();
    const hasHadBirthdayThisYear = todayMonth > parsedDate.month || (todayMonth === parsedDate.month && todayDay >= parsedDate.day);
    const age = todayYear - parsedDate.year - (hasHadBirthdayThisYear ? 0 : 1);

    return age >= 18;
  }

  isChecked(selection: string[], value: string): boolean {
    return selection.includes(value);
  }

  toggleSelection(selection: string[], value: string, event: Event): void {
    const checked = (event.target as HTMLInputElement).checked;
    const index = selection.indexOf(value);
    if (checked && index === -1) {
      selection.push(value);
    }
    if (!checked && index !== -1) {
      selection.splice(index, 1);
    }
  }

  isManualReviewNeeded(): boolean {
    return this.form.onParoleOrProbation === 'prefer_not_to_say' || this.form.registeredSexOffender === 'prefer_not_to_say';
  }

  onSubmit(intakeForm?: NgForm): void {
    this.validationAttempted = true;
    const validationErrors = this.getValidationErrors();

    if (validationErrors.length > 0) {
      intakeForm?.control.markAllAsTouched();
      this.error = 'Please correct the required intake fields before submitting.';
      this.errorDetails = validationErrors;
      return;
    }

    this.submitting = true;
    this.error = '';
    this.errorDetails = [];

    this.api.submitIntake(this.createPayload()).subscribe({
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

  private createPayload(): IntakeSubmissionRequest {
    const livingSituation = [
      ...this.form.currentLivingSituationSelections,
      ...(this.form.currentLivingSituationOther.trim() ? [`other:${this.form.currentLivingSituationOther.trim()}`] : []),
    ];

    const payload: IntakeSubmissionRequest = {
      dateOfIntake: this.form.dateOfIntake,
      referralAgency: this.trim(this.form.referralAgency),
      staffReceiving: this.trim(this.form.staffReceiving),
      programLocation: this.trim(this.form.programLocation),
      ageAttested: true,
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      dateOfBirth: this.form.dateOfBirth,
      phone: this.form.phone.trim(),
      email: this.form.email.trim().toLowerCase(),
      ssn: this.trim(this.form.ssn)?.replace(/\D/g, ''),
      gender: this.trim(this.form.gender),
      genderSelfDescribe: this.form.gender === 'self_describe' ? this.trim(this.form.genderSelfDescribe) : undefined,
      emergencyContactName: this.trim(this.form.emergencyContactName),
      emergencyContactPhone: this.trim(this.form.emergencyContactPhone),
      emergencyContactRelationship: this.trim(this.form.emergencyContactRelationship),
      currentLivingSituation: livingSituation.length ? JSON.stringify(livingSituation) : undefined,
      referralSourceType: this.trim(this.form.referralSourceType),
      agencyProgramName: this.trim(this.form.agencyProgramName),
      referrerContactName: this.trim(this.form.referrerContactName),
      referrerContactPhone: this.trim(this.form.referrerContactPhone),
      referrerEmail: this.trim(this.form.referrerEmail),
      hasIncome: this.trim(this.form.hasIncome),
      incomeType: this.form.incomeTypeSelections.length ? JSON.stringify(this.form.incomeTypeSelections) : undefined,
      monthlyIncome: this.trim(this.form.monthlyIncome),
      disabilityAccommodations: this.trim(this.form.disabilityAccommodations),
      preferredRoomType: this.trim(this.form.preferredRoomType),
      adlCapable: this.trim(this.form.adlCapable),
      adlSupportNeeds: this.trim(this.form.adlSupportNeeds),
      homeHealthProvider: this.trim(this.form.homeHealthProvider),
      homeHealthAgency: this.trim(this.form.homeHealthAgency),
      onParoleOrProbation: this.trim(this.form.onParoleOrProbation),
      poContact: this.form.onParoleOrProbation === 'yes' ? this.trim(this.form.poContact) : undefined,
      registeredSexOffender: this.trim(this.form.registeredSexOffender),
      flaggedForManualReview: this.isManualReviewNeeded(),
      participantInitials: this.trim(this.form.participantInitials),
      participantSignature: this.trim(this.form.participantSignature),
      participantSignatureDate: this.form.participantSignatureDate,
      staffName: this.trim(this.form.staffName),
      staffSignature: this.trim(this.form.staffSignature),
      staffSignatureDate: this.form.staffSignatureDate,
      programAgreement1: this.form.programAgreement1,
      programAgreement2: this.form.programAgreement2,
    };

    return this.withoutBlankValues(payload);
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

    return /^\d{4}$/.test(trimmedSsn);
  }

  private isAdultDateOfBirth(): boolean {
    return this.isValidIsoDate(this.form.dateOfBirth) && this.isAtLeast18(this.form.dateOfBirth);
  }

  private isValidIsoDate(value: string | undefined): boolean {
    return this.parseIsoDate(value) !== null;
  }

  private parseIsoDate(value: string | undefined): { year: number; month: number; day: number } | null {
    const trimmed = (value || '').trim();
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(trimmed);

    if (!match) {
      return null;
    }

    const [, yearValue, monthValue, dayValue] = match;
    const year = Number(yearValue);
    const month = Number(monthValue);
    const day = Number(dayValue);
    const date = new Date(year, month - 1, day);

    if (year < 1900 || date.getFullYear() !== year || date.getMonth() + 1 !== month || date.getDate() !== day) {
      return null;
    }

    return { year, month, day };
  }

  private getDateOfBirthErrorMessage(): string {
    const dateOfBirth = (this.form.dateOfBirth || '').trim();

    if (!dateOfBirth) {
      return 'Date of birth is required.';
    }

    if (!this.isValidIsoDate(dateOfBirth)) {
      return 'Enter a valid date of birth.';
    }

    if (!this.isAtLeast18(dateOfBirth)) {
      return 'This form is for adults 18 and older. Please speak with staff for assistance.';
    }

    return 'Enter a valid date of birth.';
  }

  private isPhoneValid(value: string | undefined): boolean {
    const phone = (value || '').trim();

    if (!phone) {
      return true;
    }

    const digitsOnly = phone.replace(/\D/g, '');

    return /^[+]?[-.()\d\s]+$/.test(phone) && digitsOnly.length >= 10 && digitsOnly.length <= 15;
  }

  private isEmailValid(value: string | undefined): boolean {
    const email = (value || '').trim();

    if (!email) {
      return true;
    }

    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  private isInitialsValid(): boolean {
    const initials = (this.form.participantInitials || '').trim();

    if (!initials) {
      return true;
    }

    return /^[A-Za-z]{1,4}$/.test(initials);
  }

  private getValidationErrors(): string[] {
    const errors: string[] = [];

    for (const section of this.sectionLinks) {
      for (const field of section.fields) {
        if (!this.form.ageAttested && field.key !== 'ageAttested') {
          continue;
        }

        const rawValue = this.form[field.key];
        const stringValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const isBlank = typeof stringValue === 'string' ? stringValue.length === 0 : !stringValue;

        if ((field.required && isBlank) || (!isBlank && field.validator && !field.validator())) {
          errors.push(this.getInvalidFieldMessage(field));
        }
      }
    }

    return Array.from(new Set(errors));
  }

  private getInvalidFieldMessage(field: IntakeSectionField): string {
    const rawValue = this.form[field.key];
    const stringValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
    const isBlank = typeof stringValue === 'string' ? stringValue.length === 0 : !stringValue;

    if (field.required && isBlank) {
      return field.requiredMessage || `${field.label} is required.`;
    }

    if (field.errorMessage) {
      return typeof field.errorMessage === 'function' ? field.errorMessage() : field.errorMessage;
    }

    return `${field.label} is invalid.`;
  }

  private getInvalidFieldKeys(): Set<IntakeFieldKey> {
    const invalidFields = new Set<IntakeFieldKey>();

    for (const section of this.sectionLinks) {
      for (const field of section.fields) {
        if (!this.form.ageAttested && field.key !== 'ageAttested') {
          continue;
        }

        const rawValue = this.form[field.key];
        const stringValue = typeof rawValue === 'string' ? rawValue.trim() : rawValue;
        const isBlank = typeof stringValue === 'string' ? stringValue.length === 0 : !stringValue;

        if ((field.required && isBlank) || (!isBlank && field.validator && !field.validator())) {
          invalidFields.add(field.key);
        }
      }
    }

    return invalidFields;
  }


  private clearSensitiveState(): void {
    this.form = this.createEmptyForm();
    this.showSsn = false;
  }

  private trim(value: string | undefined): string | undefined {
    const trimmed = (value || '').trim();
    return trimmed.length ? trimmed : undefined;
  }

  private withoutBlankValues(payload: IntakeSubmissionRequest): IntakeSubmissionRequest {
    return Object.fromEntries(
      Object.entries(payload).filter(([, value]) => value !== undefined && value !== ''),
    ) as IntakeSubmissionRequest;
  }

  private todayIso(): string {
    return new Date().toISOString().slice(0, 10);
  }

  private createEmptyForm(): IntakeFormState {
    const today = this.todayIso();

    return {
      dateOfIntake: today,
      referralAgency: '',
      staffReceiving: '',
      programLocation: '',
      ageAttested: false,
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      ssn: '',
      phone: '',
      email: '',
      gender: '',
      genderSelfDescribe: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      emergencyContactRelationship: '',
      currentLivingSituationSelections: [],
      currentLivingSituationOther: '',
      referralSourceType: '',
      agencyProgramName: '',
      referrerContactName: '',
      referrerContactPhone: '',
      referrerEmail: '',
      hasIncome: '',
      incomeTypeSelections: [],
      monthlyIncome: '',
      disabilityAccommodations: '',
      preferredRoomType: '',
      adlCapable: '',
      adlSupportNeeds: '',
      homeHealthProvider: '',
      homeHealthAgency: '',
      onParoleOrProbation: '',
      poContact: '',
      registeredSexOffender: '',
      flaggedForManualReview: false,
      participantInitials: '',
      participantSignature: '',
      participantSignatureDate: today,
      staffName: '',
      staffSignature: '',
      staffSignatureDate: today,
      programAgreement1: false,
      programAgreement2: false,
    };
  }
}
