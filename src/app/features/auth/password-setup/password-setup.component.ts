import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-password-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="password-setup-container">
      <div class="password-setup-card">
        <h1>Set your password</h1>
        <p class="subtitle">Choose a password to finish account setup.</p>

        <div *ngIf="success" class="alert alert-success">{{ success }}</div>
        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <form *ngIf="!success" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="newPassword">New password</label>
            <input
              id="newPassword"
              type="password"
              [(ngModel)]="newPassword"
              name="newPassword"
              autocomplete="new-password"
              required
            />
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirm password</label>
            <input
              id="confirmPassword"
              type="password"
              [(ngModel)]="confirmPassword"
              name="confirmPassword"
              autocomplete="new-password"
              required
            />
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Saving...' : 'Set password' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .password-setup-container { display:flex; align-items:center; justify-content:center; min-height:100vh; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .password-setup-card { background:#fff; width:100%; max-width:420px; padding:2rem; border-radius:10px; box-shadow:0 10px 30px rgba(0,0,0,0.2); }
    h1 { margin:0 0 .5rem; text-align:center; color:#667eea; }
    .subtitle { margin:0 0 1.5rem; text-align:center; color:#666; }
    .form-group { margin-bottom:1rem; }
    label { display:block; margin-bottom:.4rem; font-weight:600; color:#333; }
    input { width:100%; box-sizing:border-box; padding:.75rem; border:1px solid #ddd; border-radius:6px; font-size:1rem; }
    button { width:100%; padding:.85rem; border:none; border-radius:6px; cursor:pointer; background:linear-gradient(135deg, #667eea 0%, #764ba2 100%); color:#fff; font-size:1rem; font-weight:600; }
    button:disabled { opacity:.6; cursor:not-allowed; }
    .alert { padding:.9rem 1rem; border-radius:6px; margin-bottom:1rem; }
    .alert-success { background:#e8f8ee; color:#166534; border:1px solid #b7ebc6; }
    .alert-error { background:#fee; color:#b91c1c; border:1px solid #fecaca; }
  `]
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
        this.success = response.message;
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
