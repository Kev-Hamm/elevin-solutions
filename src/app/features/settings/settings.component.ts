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
    <div class="admin-route-shell settings-admin-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span *ngIf="currentUser" class="staff-chip">{{ currentUser.firstName }} {{ currentUser.lastName }}</span>
        <button type="button" class="pill-button secondary" (click)="logout()">Logout</button>
      </div>

      <main class="admin-route-body">
        <div *ngIf="showToast" class="success-banner floating-toast" role="status">Password updated successfully.</div>
        <section *ngIf="mustChangePassword" class="security-note must-change-banner" role="alert">Set a permanent password to continue using the staff portal.</section>

        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Account security</p>
            <h1>Settings</h1>
            <p>Manage password and staff portal security for your account.</p>
          </div>
          <a *ngIf="!mustChangePassword" routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
        </section>

        <div class="route-layout settings-layout">
          <section class="surface-card profile-summary-card">
            <p class="eyebrow">Profile</p>
            <h2>Profile</h2>
            <p>Signed in as <strong>{{ currentUser?.email || 'staff user' }}</strong>.</p>
            <p *ngIf="currentUser?.role">Role: <span class="status-chip neutral">{{ currentUser?.role }}</span></p>
            <p *ngIf="mustChangePassword" class="privacy-note">Other navigation is temporarily locked until your password is updated.</p>
            <a *ngIf="!mustChangePassword" routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
          </section>

          <section class="surface-card settings-security-card">
            <p class="eyebrow">Password</p>
            <h2>Change password</h2>
            <p>Update your password for staff portal access.</p>
            <div *ngIf="generalError" class="error-banner" role="alert">{{ generalError }}</div>
            <form (ngSubmit)="updatePassword()" novalidate>
              <div class="form-group"><label for="currentPassword">Current password</label><input id="currentPassword" name="currentPassword" type="password" [(ngModel)]="currentPassword" autocomplete="current-password" [attr.aria-describedby]="fieldErrors['currentPassword'] ? 'currentPassword-error' : null" /><small id="currentPassword-error" class="field-error" *ngIf="fieldErrors['currentPassword']">{{ fieldErrors['currentPassword'] }}</small></div>
              <div class="form-group"><label for="newPassword">New password</label><input id="newPassword" name="newPassword" type="password" [(ngModel)]="newPassword" (ngModelChange)="handleNewPasswordChange()" autocomplete="new-password" [attr.aria-describedby]="fieldErrors['newPassword'] ? 'newPassword-error' : null" /><small id="newPassword-error" class="field-error" *ngIf="fieldErrors['newPassword']">{{ fieldErrors['newPassword'] }}</small></div>
              <div class="password-strength-chip" [class.weak]="passwordStrength === 'Weak'" [class.fair]="passwordStrength === 'Fair'" [class.strong]="passwordStrength === 'Strong'" *ngIf="newPassword">Strength: {{ passwordStrength }}</div>
              <div class="form-group"><label for="confirmPassword">Confirm new password</label><input id="confirmPassword" name="confirmPassword" type="password" [(ngModel)]="confirmPassword" (ngModelChange)="validateConfirmPassword()" autocomplete="new-password" [attr.aria-describedby]="fieldErrors['confirmPassword'] ? 'confirmPassword-error' : null" /><small id="confirmPassword-error" class="field-error" *ngIf="fieldErrors['confirmPassword']">{{ fieldErrors['confirmPassword'] }}</small></div>
              <button type="submit" class="pill-button primary full-width-button" [disabled]="isSubmitDisabled()">{{ submitting ? 'Updating password...' : 'Update password' }}</button>
            </form>
          </section>

          <aside class="sage-panel security-flow-note">
            <p class="eyebrow">Two-factor authentication</p>
            <h2>Secure sign-in flows</h2>
            <p>TOTP setup is handled during secure sign-in/setup flows. This settings page does not expose QR seeds, tokens, recovery codes, or local storage values.</p>
          </aside>
        </div>
      </main>
    </div>
  `,
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

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();
    this.mustChangePassword = this.authService.needsPasswordChange();
    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({ next: ({ user }) => { this.currentUser = user; this.mustChangePassword = Boolean(user.forcePasswordChangeOnFirstLogin); }, error: () => this.router.navigate(['/login']) });
    }
  }

  handleNewPasswordChange(): void { this.passwordStrength = this.getPasswordStrength(this.newPassword); this.validateConfirmPassword(); if (this.fieldErrors['newPassword']) this.validateClientSide(); }
  validateConfirmPassword(): void { if (this.confirmPassword && this.confirmPassword !== this.newPassword) { this.fieldErrors['confirmPassword'] = 'Confirmation must exactly match the new password.'; return; } delete this.fieldErrors['confirmPassword']; }
  isSubmitDisabled(): boolean { return this.submitting || !this.currentPassword || !this.newPassword || !this.confirmPassword || this.newPassword.length < 8 || this.newPassword === this.currentPassword || this.confirmPassword !== this.newPassword; }

  updatePassword(): void {
    this.generalError = ''; this.fieldErrors = {};
    if (!this.validateClientSide()) return;
    this.submitting = true;
    this.authService.changePassword(this.currentPassword, this.newPassword).subscribe({
      next: () => { this.submitting = false; this.mustChangePassword = false; this.clearPasswordFields(); this.showToast = true; setTimeout(() => { this.showToast = false; }, 3000); },
      error: (err) => { this.submitting = false; const field = err.error?.field; const message = err.error?.message || 'Unable to update password right now. Please try again.'; if (field) this.fieldErrors[field] = message; else this.generalError = message; },
    });
  }

  logout(): void { this.authService.logout(); this.router.navigate(['/']); }

  private validateClientSide(): boolean {
    if (!this.currentPassword) this.fieldErrors['currentPassword'] = 'Current password is required.';
    if (!this.newPassword) this.fieldErrors['newPassword'] = 'New password is required.';
    else if (this.newPassword.length < 8) this.fieldErrors['newPassword'] = 'New password must be at least 8 characters.';
    else if (this.newPassword === this.currentPassword) this.fieldErrors['newPassword'] = 'New password must be different from current password.';
    if (!this.confirmPassword) this.fieldErrors['confirmPassword'] = 'Please confirm your new password.';
    else if (this.confirmPassword !== this.newPassword) this.fieldErrors['confirmPassword'] = 'Confirmation must exactly match the new password.';
    return Object.keys(this.fieldErrors).length === 0;
  }

  private clearPasswordFields(): void { this.currentPassword = ''; this.newPassword = ''; this.confirmPassword = ''; this.passwordStrength = ''; this.fieldErrors = {}; }
  private getPasswordStrength(password: string): 'Weak' | 'Fair' | 'Strong' | '' { if (!password) return ''; let score = 0; if (password.length >= 8) score++; if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++; if (/\d/.test(password) || /[^A-Za-z0-9]/.test(password)) score++; if (score <= 1) return 'Weak'; if (score === 2) return 'Fair'; return 'Strong'; }
}
