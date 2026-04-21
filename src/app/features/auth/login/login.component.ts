import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <div class="login-card">
        <h1>Elevin Solutions</h1>
        <p class="subtitle">Residential housing support (non-medical)</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="email">Email</label>
            <input
              type="email"
              id="email"
              [(ngModel)]="email"
              name="email"
              required
              autocomplete="email"
            />
          </div>

          <div class="form-group">
            <label for="password">Password</label>
            <input
              type="password"
              id="password"
              [(ngModel)]="password"
              name="password"
              required
              autocomplete="current-password"
            />
          </div>

          <button type="submit" [disabled]="loading">
            {{ loading ? 'Sending verification code...' : 'Login' }}
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #4f7e81 0%, #2f6f73 100%); }
    .login-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; }
    h1 { text-align: center; color: #0f2854; margin-bottom: 0.5rem; }
    .subtitle { text-align: center; color: #666; margin-bottom: 2rem; }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333; }
    input { width: 100%; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; box-sizing: border-box; }
    input:focus { outline: none; border-color: #2f6f73; box-shadow: 0 0 0 3px rgba(47, 111, 115, 0.1); }
    button { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #4f7e81 0%, #2f6f73 100%); color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; transition: opacity 0.2s; }
    button:hover:not(:disabled) { opacity: 0.9; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 1rem; background-color: #fee; color: #c00; border: 1px solid #fcc; border-radius: 4px; margin-bottom: 1rem; }
  `]
})
export class LoginComponent {
  email = '';
  password = '';
  error = '';
  loading = false;
  private returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.returnUrl = route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.error = 'Email and password are required';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigate(['/auth/otp-verify'], {
          queryParams: { returnUrl: this.returnUrl },
        });
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Login failed. Please try again.';
      },
    });
  }
}
