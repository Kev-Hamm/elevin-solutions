import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="otp-container">
      <div class="otp-card">
        <h2>Verify OTP</h2>
        <p class="subtitle">Enter the 6-digit code sent to your email</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>

        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="otp">One-Time Password</label>
            <input
              type="text"
              id="otp"
              [(ngModel)]="otpCode"
              name="otp"
              maxlength="6"
              placeholder="000000"
              inputmode="numeric"
              required
            />
            <small>{{ otpCode.length }}/6</small>
          </div>

          <div class="timer">Code expires in {{ expiresIn }}s</div>

          <button type="submit" [disabled]="loading || otpCode.length !== 6">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>
        </form>

        <p class="back-link">
          <a routerLink="/login">Back to login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .otp-container { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: linear-gradient(135deg, #4f7e81 0%, #2f6f73 100%); }
    .otp-card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2); width: 100%; max-width: 400px; }
    h2 { text-align: center; color: #0f2854; margin-bottom: 0.5rem; }
    .subtitle { text-align: center; color: #666; margin-bottom: 1.5rem; }
    .form-group { margin-bottom: 1.5rem; position: relative; }
    label { display: block; margin-bottom: 0.5rem; font-weight: 500; color: #333; }
    input { width: 100%; padding: 0.75rem; border: 2px solid #ddd; border-radius: 4px; font-size: 1.5rem; letter-spacing: 0.5rem; text-align: center; font-family: 'Courier New', monospace; box-sizing: border-box; }
    input:focus { outline: none; border-color: #2f6f73; box-shadow: 0 0 0 3px rgba(47, 111, 115, 0.1); }
    small { display: block; margin-top: 0.25rem; color: #999; font-size: 0.85rem; }
    .timer { text-align: center; color: #f77; font-weight: 500; margin-bottom: 1rem; }
    button { width: 100%; padding: 0.75rem; background: linear-gradient(135deg, #4f7e81 0%, #2f6f73 100%); color: white; border: none; border-radius: 4px; font-size: 1rem; cursor: pointer; margin-bottom: 0.5rem; transition: opacity 0.2s; }
    button:hover:not(:disabled) { opacity: 0.9; }
    button:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert { padding: 1rem; border-radius: 4px; margin-bottom: 1rem; background-color: #fee; color: #c00; border: 1px solid #fcc; }
    .back-link { text-align: center; margin-top: 1rem; color: #666; font-size: 0.9rem; }
    .back-link a { color: #2f6f73; text-decoration: none; }
    .back-link a:hover { text-decoration: underline; }
  `]
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

  ngOnInit(): void {
    if (!this.challengeToken) {
      this.router.navigate(['/login']);
      return;
    }

    this.expiryInterval = setInterval(() => {
      this.expiresIn = Math.max(this.expiresIn - 1, 0);
      if (this.expiresIn === 0 && this.expiryInterval) {
        this.error = 'OTP expired. Please log in again.';
        clearInterval(this.expiryInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
  }

  onSubmit(): void {
    if (this.otpCode.length !== 6) {
      this.error = 'Please enter a valid 6-digit code';
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
        this.error = err.error?.message || 'Invalid OTP. Please try again.';
      },
    });
  }
}
