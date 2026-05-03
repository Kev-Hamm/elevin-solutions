import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="settings-page">
      <nav class="navbar">
        <div class="navbar-content">
          <div>
            <h2>Elevin Solutions</h2>
            <p class="nav-subtitle">Staff portal settings</p>
          </div>
          <div class="user-info" *ngIf="currentUser">
            <span>{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
            <button type="button" class="logout-btn" (click)="logout()">Logout</button>
          </div>
        </div>
      </nav>

      <main class="container">
        <div *ngIf="showToast" class="toast success">Password updated successfully.</div>

        <section *ngIf="mustChangePassword" class="alert-banner">
          You must set a permanent password before accessing the rest of the staff portal.
        </section>

        <div class="cards">
          <section class="card profile-card">
            <h1>Settings</h1>
            <h2>Profile and preferences</h2>
            <p class="muted">Signed in as {{ currentUser?.email || 'staff user' }}.</p>
            <p class="muted" *ngIf="mustChangePassword">Other navigation is temporarily locked until your password is updated.</p>
            <a *ngIf="!mustChangePassword" routerLink="/dashboard" class="secondary-link">Back to dashboard</a>
          </section>

          <section class="card security-card">
            <h2>Change password</h2>
            <p class="muted">Update your password for staff portal access.</p>

            <div *ngIf="generalError" class="alert-error">{{ generalError }}</div>

            <form (ngSubmit)="updatePassword()" novalidate>
              <div class="form-group">
                <label for="currentPassword">Current password</label>
                <input id="currentPassword" name="currentPassword" type="password" [(ngModel)]="currentPassword" autocomplete="current-password" />
                <small class="field-error" *ngIf="fieldErrors['currentPassword']">{{ fieldErrors['currentPassword'] }}</small>
              </div>

              <div class="form-group">
                <label for="newPassword">New password</label>
                <input id="newPassword" name="newPassword" type="password" [(ngModel)]="newPassword" (ngModelChange)="handleNewPasswordChange()" autocomplete="new-password" />
                <small class="field-error" *ngIf="fieldErrors['newPassword']">{{ fieldErrors['newPassword'] }}</small>
              </div>

              <div class="strength-indicator" [class.weak]="passwordStrength === 'Weak'" [class.fair]="passwordStrength === 'Fair'" [class.strong]="passwordStrength === 'Strong'" *ngIf="newPassword">
                Strength: {{ passwordStrength }}
              </div>

              <div class="form-group">
                <label for="confirmPassword">Confirm new password</label>
                <input id="confirmPassword" name="confirmPassword" type="password" [(ngModel)]="confirmPassword" (ngModelChange)="validateConfirmPassword()" autocomplete="new-password" />
                <small class="field-error" *ngIf="fieldErrors['confirmPassword']">{{ fieldErrors['confirmPassword'] }}</small>
              </div>

              <button type="submit" [disabled]="isSubmitDisabled()">
                {{ submitting ? 'Updating...' : 'Update password' }}
              </button>
            </form>
          </section>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .settings-page { min-height: 100vh; background: #f5f7fb; }
    .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 1rem 0; }
    .navbar-content { max-width: 1100px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; gap: 1rem; }
    .navbar-content h2, .navbar-content p { margin: 0; }
    .nav-subtitle { opacity: 0.85; font-size: 0.9rem; }
    .user-info { display: flex; align-items: center; gap: 1rem; }
    .logout-btn, button { border: none; border-radius: 6px; cursor: pointer; }
    .logout-btn { padding: 0.65rem 1rem; background: rgba(255,255,255,0.18); color: #fff; }
    .container { max-width: 1100px; margin: 0 auto; padding: 2rem 1rem 3rem; }
    .toast { position: sticky; top: 1rem; margin: 0 auto 1rem; max-width: 420px; padding: 0.9rem 1rem; border-radius: 8px; text-align: center; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 5; }
    .toast.success { background: #e8f8ee; color: #166534; border: 1px solid #b7ebc6; }
    .alert-banner { margin-bottom: 1.5rem; padding: 1rem 1.25rem; border-radius: 10px; background: #fff5d6; border: 1px solid #f4d67a; color: #7a5a00; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 1.5rem; align-items: start; }
    .card { background: #fff; border-radius: 14px; padding: 1.5rem; box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08); }
    .card h1 { margin-top: 0; margin-bottom: 0.75rem; color: #1f2937; }
    .card h2 { margin: 0 0 0.75rem; color: #1f2937; }
    .muted { color: #6b7280; margin-bottom: 1rem; }
    .secondary-link { color: #5b6ee1; text-decoration: none; font-weight: 600; }
    .secondary-link:hover { text-decoration: underline; }
    .form-group { margin-bottom: 1rem; }
    label { display: block; margin-bottom: 0.4rem; font-weight: 600; color: #374151; }
    input { width: 100%; box-sizing: border-box; padding: 0.8rem 0.9rem; border: 1px solid #d1d5db; border-radius: 8px; font-size: 1rem; }
    input:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.12); }
    .strength-indicator { margin: -0.2rem 0 1rem; font-weight: 600; }
    .strength-indicator.weak { color: #b91c1c; }
    .strength-indicator.fair { color: #b45309; }
    .strength-indicator.strong { color: #15803d; }
    .field-error, .alert-error { color: #b91c1c; }
    .field-error { display: block; margin-top: 0.35rem; }
    .alert-error { margin-bottom: 1rem; padding: 0.9rem 1rem; border-radius: 8px; background: #fef2f2; border: 1px solid #fecaca; }
    button[type='submit'] { width: 100%; padding: 0.9rem 1rem; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; font-size: 1rem; font-weight: 600; }
    button[type='submit']:disabled { opacity: 0.6; cursor: not-allowed; }
  `]
})
export class SettingsComponent implements OnInit {
  currentUser: User | null = null;
  mustChangePassword = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordStrength = '';
  submitting = false;
  showToast = false;
  generalError = '';
  fieldErrors: Record<string, string> = {};

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();
    this.mustChangePassword = this.authService.needsPasswordChange();

    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: ({ user }) => {
          this.currentUser = user;
          this.mustChangePassword = Boolean(user.forcePasswordChangeOnFirstLogin);
        },
        error: () => this.router.navigate(['/login']),
      });
    }
  }

  handleNewPasswordChange(): void {
    this.passwordStrength = this.getPasswordStrength(this.newPassword);
    this.validateConfirmPassword();
    if (this.fieldErrors['newPassword']) {
      this.validateClientSide();
    }
  }

  validateConfirmPassword(): void {
    if (this.confirmPassword && this.confirmPassword !== this.newPassword) {
      this.fieldErrors['confirmPassword'] = 'Confirmation must exactly match the new password.';
      return;
    }

    delete this.fieldErrors['confirmPassword'];
  }

  isSubmitDisabled(): boolean {
    return this.submitting
      || !this.currentPassword
      || !this.newPassword
      || !this.confirmPassword
      || this.newPassword.length < 8
      || this.newPassword === this.currentPassword
      || this.confirmPassword !== this.newPassword;
  }

  updatePassword(): void {
    this.generalError = '';
    this.fieldErrors = {};

    if (!this.validateClientSide()) {
      return;
    }

    this.submitting = true;

    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => {
        this.submitting = false;
        this.mustChangePassword = false;
        this.clearPasswordFields();
        this.showToast = true;
        setTimeout(() => {
          this.showToast = false;
        }, 3000);
      },
      error: (err) => {
        this.submitting = false;
        const field = err.error?.field;
        const message = err.error?.message || 'Unable to update password right now. Please try again.';

        if (field) {
          this.fieldErrors[field] = message;
          if (field === 'confirmPassword') {
            this.fieldErrors['confirmPassword'] = message;
          }
        } else {
          this.generalError = message;
        }
      },
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }

  private validateClientSide(): boolean {
    if (!this.currentPassword) {
      this.fieldErrors['currentPassword'] = 'Current password is required.';
    }

    if (!this.newPassword) {
      this.fieldErrors['newPassword'] = 'New password is required.';
    } else if (this.newPassword.length < 8) {
      this.fieldErrors['newPassword'] = 'New password must be at least 8 characters.';
    } else if (this.newPassword === this.currentPassword) {
      this.fieldErrors['newPassword'] = 'New password must be different from current password.';
    }

    if (!this.confirmPassword) {
      this.fieldErrors['confirmPassword'] = 'Please confirm your new password.';
    } else if (this.confirmPassword !== this.newPassword) {
      this.fieldErrors['confirmPassword'] = 'Confirmation must exactly match the new password.';
    }

    return Object.keys(this.fieldErrors).length === 0;
  }

  private clearPasswordFields(): void {
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
    this.passwordStrength = '';
    this.fieldErrors = {};
  }

  private getPasswordStrength(password: string): 'Weak' | 'Fair' | 'Strong' | '' {
    if (!password) {
      return '';
    }

    let score = 0;
    if (password.length >= 8) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 1) return 'Weak';
    if (score === 2) return 'Fair';
    return 'Strong';
  }
}
