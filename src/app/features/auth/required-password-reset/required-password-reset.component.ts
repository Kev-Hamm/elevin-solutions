import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../../core/services/auth.service';

@Component({
  selector: 'app-required-password-reset',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-shell password-setup-auth-shell">
      <a routerLink="/" class="auth-brand-link" aria-label="Elevin Solutions public home">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span>
          <strong>Elevin Solutions</strong>
          <small>Staff Dashboard</small>
        </span>
      </a>

      <main class="auth-layout single" aria-labelledby="required-reset-title">
        <section class="auth-card password-setup-card">
          <p class="auth-eyebrow">Password reset required</p>
          <h1 id="required-reset-title" class="auth-title">Choose a new staff password</h1>
          <p class="auth-lede">Before you continue to the Staff Dashboard, update the temporary or admin-reset password on this account.</p>

          <div *ngIf="currentUser" class="auth-security-note compact">
            Signed in as {{ currentUser.email }}. Use the password you just signed in with as the current password.
          </div>

          <div *ngIf="success" class="auth-alert success" role="status">{{ success }}</div>
          <div *ngIf="error" class="auth-alert error" role="alert">{{ error }}</div>

          <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
            <div class="auth-field">
              <label for="currentPassword">Current password</label>
              <input class="auth-input" id="currentPassword" type="password" [(ngModel)]="currentPassword" name="currentPassword" autocomplete="current-password" required />
            </div>

            <div class="auth-field">
              <label for="newPassword">New password</label>
              <input class="auth-input" id="newPassword" type="password" [(ngModel)]="newPassword" name="newPassword" autocomplete="new-password" required />
              <small *ngIf="newPassword" class="auth-field-hint">Strength: {{ passwordStrength }}</small>
            </div>

            <div class="auth-field">
              <label for="confirmPassword">Confirm new password</label>
              <input class="auth-input" id="confirmPassword" type="password" [(ngModel)]="confirmPassword" name="confirmPassword" autocomplete="new-password" required />
            </div>

            <button class="auth-primary-button" type="submit" [disabled]="loading">
              {{ loading ? 'Updating...' : 'Reset password and continue' }}
            </button>
          </form>

          <button type="button" class="auth-secondary-link button-link" (click)="logout()">Use a different account</button>
        </section>
      </main>
    </div>
  `,
})
export class RequiredPasswordResetComponent implements OnInit {
  currentUser: User | null = null;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  error = '';
  success = '';
  loading = false;

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();
    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: ({ user }) => {
          this.currentUser = user;
          if (!user.forcePasswordChangeOnFirstLogin) this.router.navigate(['/dashboard']);
        },
        error: () => this.router.navigate(['/login']),
      });
      return;
    }

    if (!this.currentUser.forcePasswordChangeOnFirstLogin) {
      this.router.navigate(['/dashboard']);
    }
  }

  get passwordStrength(): 'Weak' | 'Fair' | 'Strong' {
    let score = 0;
    if (this.newPassword.length >= 8) score++;
    if (/[A-Z]/.test(this.newPassword) && /[a-z]/.test(this.newPassword)) score++;
    if (/\d/.test(this.newPassword) || /[^A-Za-z0-9]/.test(this.newPassword)) score++;
    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    return 'Strong';
  }

  onSubmit(): void {
    this.error = '';
    this.success = '';

    if (!this.currentPassword) {
      this.error = 'Current password is required.';
      return;
    }

    if (!this.newPassword || this.newPassword.length < 8) {
      this.error = 'New password must be at least 8 characters.';
      return;
    }

    if (this.newPassword === this.currentPassword) {
      this.error = 'New password must be different from the current password.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.error = 'Confirmation must match the new password.';
      return;
    }

    this.loading = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'Password updated. Opening the Staff Dashboard...';
        setTimeout(() => this.router.navigate(['/dashboard']), 800);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Unable to update password right now.';
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
