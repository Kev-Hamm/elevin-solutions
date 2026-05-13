import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="auth-shell otp-auth-shell">
      <a routerLink="/" class="auth-brand-link" aria-label="Elevin Solutions public home">
        <span class="brand-mark" aria-hidden="true">E</span>
        <span>
          <strong>Elevin Solutions</strong>
          <small>Two-factor verification</small>
        </span>
      </a>

      <main class="auth-layout single" aria-labelledby="otp-title">
        <section class="auth-card otp-card">
          <p class="auth-eyebrow">Two-factor verification</p>
          <h1 id="otp-title" class="auth-title">Enter your verification code</h1>
          <p class="auth-lede">
            We sent a 6-digit code to the staff email on this sign-in attempt.
          </p>

          <div *ngIf="error" class="auth-alert error" role="alert">{{ error }}</div>

          <form class="auth-form" (ngSubmit)="onSubmit()" novalidate>
            <div class="auth-field">
              <label for="otp">6-digit code</label>
              <input
                class="auth-input otp-input"
                type="text"
                id="otp"
                [(ngModel)]="otpCode"
                (ngModelChange)="onOtpInput($event)"
                name="otp"
                maxlength="6"
                placeholder="000000"
                inputmode="numeric"
                autocomplete="one-time-code"
                pattern="[0-9]*"
                required
                [disabled]="loading || expiresIn === 0"
              />
              <div class="auth-meta-row">
                <small>{{ otpCode.length }}/6 digits entered</small>
                <span class="timer-chip" [class.warning]="expiresIn > 0 && expiresIn < 60" [class.expired]="expiresIn === 0">
                  {{ expiresIn === 0 ? 'Code expired' : 'Code expires in ' + formattedExpiresIn }}
                </span>
              </div>
            </div>

            <button class="auth-primary-button" type="submit" [disabled]="loading || otpCode.length !== 6 || expiresIn === 0">
              {{ loading ? 'Verifying...' : 'Verify code' }}
            </button>
          </form>

          <div class="auth-security-note compact">
            For your security, signing in again will start a new verification attempt.
          </div>

          <a routerLink="/login" class="auth-secondary-link">Use a different account</a>
        </section>
      </main>
    </div>
  `,
  styles: []
})
export class OTPVerifyComponent implements OnInit, OnDestroy {
  otpCode = '';
  error = '';
  loading = false;
  expiresIn = 300;
  challengeToken = '';
  private expiryInterval?: ReturnType<typeof setInterval>;
  private returnUrl = '/dashboard';

  constructor(
    private authService: AuthService,
    private router: Router,
    route: ActivatedRoute
  ) {
    this.challengeToken = this.authService.getChallengeToken() || '';
    this.expiresIn = this.authService.getOtpExpiresIn();
    this.returnUrl = route.snapshot.queryParamMap.get('returnUrl') || '/dashboard';
  }

  get formattedExpiresIn(): string {
    const minutes = Math.floor(this.expiresIn / 60);
    const seconds = this.expiresIn % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnInit(): void {
    if (!this.challengeToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.expiryInterval = setInterval(() => {
      this.expiresIn = Math.max(this.expiresIn - 1, 0);
      if (this.expiresIn === 0 && this.expiryInterval) {
        this.error = 'This code has expired. Please sign in again to request a new code.';
        clearInterval(this.expiryInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
  }

  onOtpInput(value: string): void {
    const normalized = (value || '').replace(/\D/g, '').slice(0, 6);
    if (normalized !== this.otpCode) {
      this.otpCode = normalized;
    }
  }

  onSubmit(): void {
    if (this.otpCode.length !== 6) {
      this.error = 'Please enter a valid 6-digit code.';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyOTP(this.challengeToken, this.otpCode).subscribe({
      next: (response) => {
        this.loading = false;
        this.router.navigate([response.user.forcePasswordChangeOnFirstLogin ? '/settings' : this.returnUrl]);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Unable to verify that code. Please try again.';
      },
    });
  }
}
