import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-public-intake',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <section class="hero">
        <div>
          <p class="eyebrow">Elevin Solutions</p>
          <h1>Housing intake request</h1>
          <p class="lede">Submit a placement intake and our team will review it promptly.</p>
        </div>
        <a class="staff-link" routerLink="/login">Staff portal</a>
      </section>

      <form class="card" (ngSubmit)="submit()">
        <div *ngIf="message" class="alert success">{{ message }}</div>
        <div *ngIf="error" class="alert error">{{ error }}</div>

        <div class="grid">
          <label><span>First name</span><input [(ngModel)]="form.firstName" name="firstName" required /></label>
          <label><span>Last name</span><input [(ngModel)]="form.lastName" name="lastName" required /></label>
          <label><span>Date of birth</span><input type="date" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" required /></label>
          <label><span>Phone</span><input [(ngModel)]="form.phone" name="phone" required /></label>
          <label><span>Email</span><input type="email" [(ngModel)]="form.email" name="email" required /></label>
          <label class="full"><span>Current shelter/address</span><input [(ngModel)]="form.address" name="address" required /></label>
          <label><span>ID type</span><input [(ngModel)]="form.idType" name="idType" required /></label>
          <label><span>ID number</span><input [(ngModel)]="form.idNumber" name="idNumber" required /></label>
        </div>

        <button [disabled]="loading">{{ loading ? 'Submitting...' : 'Submit intake' }}</button>
      </form>
    </div>
  `,
  styles: [`
    .page { min-height: 100vh; padding: 32px 16px; background: #f3f4f6; color: #111827; }
    .hero, .card { max-width: 960px; margin: 0 auto; }
    .hero { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-bottom:24px; }
    .eyebrow { text-transform: uppercase; letter-spacing: .16em; color:#2563eb; font-weight:700; margin-bottom:8px; }
    h1 { font-size: clamp(2rem, 5vw, 3.5rem); margin: 0 0 8px; }
    .lede { color:#4b5563; max-width: 42rem; }
    .staff-link { background:#111827; color:#fff; padding:12px 18px; border-radius:999px; text-decoration:none; white-space:nowrap; }
    .card { background:#fff; border-radius:20px; padding:24px; box-shadow:0 10px 35px rgba(0,0,0,.08); }
    .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(220px,1fr)); gap:16px; margin-bottom:20px; }
    label { display:flex; flex-direction:column; gap:8px; font-weight:600; }
    .full { grid-column:1/-1; }
    input { padding:12px 14px; border:1px solid #d1d5db; border-radius:12px; font-size:1rem; }
    button { background:#2563eb; color:#fff; border:0; border-radius:12px; padding:14px 18px; font-size:1rem; font-weight:700; cursor:pointer; }
    .alert { padding:12px 14px; border-radius:12px; margin-bottom:16px; }
    .success { background:#ecfdf5; color:#065f46; }
    .error { background:#fef2f2; color:#991b1b; }
  `]
})
export class PublicIntakeComponent {
  loading = false;
  error = '';
  message = '';
  form = {
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    idType: '',
    idNumber: '',
  };

  constructor(private api: ApiService) {}

  submit(): void {
    this.loading = true;
    this.error = '';
    this.message = '';
    this.api.submitPublicIntake(this.form).subscribe({
      next: () => {
        this.loading = false;
        this.message = 'Intake submitted successfully.';
        this.form = { firstName: '', lastName: '', dateOfBirth: '', phone: '', email: '', address: '', idType: '', idNumber: '' };
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to submit intake.';
      }
    });
  }
}
