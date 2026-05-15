import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-route-shell clients-page client-form-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Resident support</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body narrow">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Resident support</p>
            <h1>Add client</h1>
            <p>Create a minimal resident profile for housing coordination. Date of birth and address stay on this form surface and are not shown in the directory.</p>
          </div>
          <a routerLink="/clients" class="pill-button secondary">Back to clients</a>
        </section>

        <div class="route-layout two-column-form">
          <section class="surface-card client-form-card">
            <form (ngSubmit)="onSubmit()">
              <div class="form-grid">
                <div class="form-group">
                  <label for="firstName">First name</label>
                  <input type="text" id="firstName" [(ngModel)]="form.firstName" name="firstName" required />
                </div>
                <div class="form-group">
                  <label for="lastName">Last name</label>
                  <input type="text" id="lastName" [(ngModel)]="form.lastName" name="lastName" required />
                </div>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" [(ngModel)]="form.email" name="email" autocomplete="email" />
                </div>
                <div class="form-group">
                  <label for="phone">Phone</label>
                  <input type="tel" id="phone" [(ngModel)]="form.phone" name="phone" autocomplete="tel" />
                </div>
                <div class="form-group full-width">
                  <label for="address">Address</label>
                  <input type="text" id="address" [(ngModel)]="form.address" name="address" autocomplete="street-address" />
                </div>
                <div class="form-group">
                  <label for="dob">Date of birth</label>
                  <input type="date" id="dob" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" />
                </div>
              </div>

              <div *ngIf="error" class="error-banner" role="alert">{{ error }}</div>

              <div class="form-actions">
                <button type="submit" class="pill-button primary" [disabled]="loading">{{ loading ? 'Saving client...' : 'Save client' }}</button>
                <a routerLink="/clients" class="pill-button secondary">Cancel</a>
              </div>
            </form>
          </section>

          <aside class="sage-panel client-privacy-note">
            <p class="eyebrow">Privacy note</p>
            <h2>Keep the profile focused.</h2>
            <p>Client DOB and address are PII. Use only for residential support coordination and avoid adding medical or treatment framing.</p>
          </aside>
        </div>
      </main>
    </div>
  `,
})
export class ClientFormComponent implements OnInit {
  form: any = { firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '' };
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true; this.error = '';
    this.api.createClient(this.form).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/clients']); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Failed to save client'; }
    });
  }
}
