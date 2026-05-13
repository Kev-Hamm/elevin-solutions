import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-password-setup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-shell password-setup-auth-shell">
      <a routerLink="/" class="auth-brand-link" aria-label="Elevin Solutions public home">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span>
          <strong>Elevin Solutions</strong>
          <small>Account setup</small>
        </span>
      </a>

      <main class="auth-layout single" aria-labelledby="password-setup-title">
        <section class="auth-card password-setup-card">
          <p class="auth-eyebrow">Account setup</p>
          <h1 id="password-setup-title" class="auth-title">Set your staff password</h1>
          <p class="auth-lede">Choose a password to finish staff portal setup.</p>

          <div class="auth-security-note">Use a password you do not use anywhere else.</div>

          <div *ngIf="success" class="auth-alert success" role="status">{{ success }}</div>
          <div *ngIf="error" class="auth-alert error" role="alert">{{ error }}</div>

          <form class="auth-form" *ngIf="!success" (ngSubmit)="onSubmit()" novalidate>
            <div class="auth-field">
              <label for="newPassword">New password</label>
              <input
                class="auth-input"
                id="newPassword"
                type="password"
                [(ngModel)]="newPassword"
                name="newPassword"
                autocomplete="new-password"
                required
              />
            </div>

            <div class="auth-field">
              <label for="confirmPassword">Confirm password</label>
              <input
                class="auth-input"
                id="confirmPassword"
                type="password"
                [(ngModel)]="confirmPassword"
                name="confirmPassword"
                autocomplete="new-password"
                required
              />
            </div>

            <button class="auth-primary-button" type="submit" [disabled]="loading">
              {{ loading ? 'Saving...' : 'Set password' }}
            </button>
          </form>

          <a routerLink="/login" class="auth-secondary-link">Back to sign in</a>
        </section>
      </main>
    </div>
  `,
  styles: []
})
export class PasswordSetupComponent {
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;
  private token = '';

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.token = route.snapshot.queryParamMap.get('token') || '';

    if (!this.token) {
      this.error = 'Password setup link is missing or invalid.';
    }
  }

  onSubmit(): void {
    if (!this.token) {
      this.error = 'Password setup link is missing or invalid.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Confirmation must match the new password.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.completePasswordSetup(this.token, this.newPassword).subscribe({
      next: (response) => {
        this.loading = false;
        this.success = response.message || 'Password set. Redirecting to sign in...';
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 1500);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Unable to complete password setup right now.';
      },
    });
  }
}
