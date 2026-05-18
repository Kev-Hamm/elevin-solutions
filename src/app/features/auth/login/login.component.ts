import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-shell login-auth-shell">
      <a routerLink="/" class="auth-brand-link" aria-label="Elevin Solutions public home">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span>
          <strong>Elevin Solutions</strong>
          <small>Staff dashboard</small>
        </span>
      </a>

      <main class="auth-layout" aria-labelledby="login-title">
        <section class="auth-card login-card">
          <p class="auth-eyebrow">Staff dashboard</p>
          <h1 id="login-title" class="auth-title">Staff Dashboard</h1>
          <p class="auth-lede">
            Use your staff credentials to review referrals and manage housing operations.
          </p>

          <div class="auth-security-note">
            A one-time verification code is required before dashboard access.
          </div>

          <div *ngIf="error" class="auth-alert error" role="alert">{{ error }}</div>

          <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
            <div class="auth-field">
              <label for="email">Staff email</label>
              <input
                class="auth-input"
                type="email"
                id="email"
                [(ngModel)]="email"
                name="email"
                required
                autocomplete="email"
              />
            </div>

            <div class="auth-field">
              <label for="password">Password</label>
              <input
                class="auth-input"
                type="password"
                id="password"
                [(ngModel)]="password"
                name="password"
                required
                autocomplete="current-password"
              />
            </div>

            <button class="auth-primary-button" type="submit" [disabled]="loading || !email || !password">
              {{ loading ? 'Sending verification code...' : 'Continue securely' }}
            </button>
          </form>

          <a routerLink="/" class="auth-secondary-link">Back to public home</a>
        </section>

        <aside class="auth-companion-card" aria-label="Secure housing operations">
          <p class="auth-eyebrow">Secure housing operations</p>
          <h2>A calm staff dashboard for intake, clients, units, and check-ins.</h2>
          <p>
            Built for protected daily workflows with two-factor verification before staff dashboard access.
          </p>
        </aside>
      </main>
    </div>
  `,
  styles: []
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
      this.error = 'Staff email and password are required.';
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
        this.error = err.error?.message || 'Unable to sign in. Please check your credentials and try again.';
      },
    });
  }
}
