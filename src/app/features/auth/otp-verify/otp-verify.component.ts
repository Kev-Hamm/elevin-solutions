import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-otp-verify',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="otp-container">
      <div class="otp-card">
        <h2>Verify OTP</h2>
        <p class="subtitle">Enter the 6-digit code sent to your email or phone</p>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>

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

          <div class="timer">
            Code expires in {{ expiresIn }}s
          </div>

          <button type="submit" [disabled]="loading || otpCode.length !== 6">
            {{ loading ? 'Verifying...' : 'Verify' }}
          </button>

          <button
            type="button"
            (click)="resendOTP()"
            [disabled]="loading || resendCooldown > 0"
            class="secondary"
          >
            {{ resendCooldown > 0 ? ('Resend in ' + resendCooldown + 's') : 'Resend Code' }}
          </button>
        </form>

        <p class="back-link">
          <a href="#/login">Back to login</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .otp-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    }

    .otp-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 400px;
    }

    h2 {
      text-align: center;
      color: #667eea;
      margin-bottom: 0.5rem;
    }

    .subtitle {
      text-align: center;
      color: #666;
      margin-bottom: 1.5rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
      position: relative;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 500;
      color: #333;
    }

    input {
      width: 100%;
      padding: 0.75rem;
      border: 2px solid #ddd;
      border-radius: 4px;
      font-size: 1.5rem;
      letter-spacing: 0.5rem;
      text-align: center;
      font-family: 'Courier New', monospace;

      &:focus {
        outline: none;
        border-color: #667eea;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
      }
    }

    small {
      display: block;
      margin-top: 0.25rem;
      color: #999;
      font-size: 0.85rem;
    }

    .timer {
      text-align: center;
      color: #f77;
      font-weight: 500;
      margin-bottom: 1rem;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 4px;
      font-size: 1rem;
      cursor: pointer;
      margin-bottom: 0.5rem;
      transition: opacity 0.2s;

      &:hover:not(:disabled) {
        opacity: 0.9;
      }

      &:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      &.secondary {
        background: #666;

        &:hover:not(:disabled) {
          background: #555;
        }
      }
    }

    .alert {
      padding: 1rem;
      border-radius: 4px;
      margin-bottom: 1rem;

      &.alert-error {
        background-color: #fee;
        color: #c00;
        border: 1px solid #fcc;
      }

      &.alert-success {
        background-color: #efe;
        color: #060;
        border: 1px solid #cfc;
      }
    }

    .back-link {
      text-align: center;
      margin-top: 1rem;
      color: #666;
      font-size: 0.9rem;

      a {
        color: #667eea;
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class OTPVerifyComponent implements OnInit {
  otpCode = '';
  error = '';
  success = '';
  loading = false;
  expiresIn = 300; // 5 minutes
  resendCooldown = 0;
  userId = '';

  private expiryInterval: any;
  private cooldownInterval: any;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {
    const stored = localStorage.getItem('loginUserId');
    if (stored) {
      this.userId = stored;
    }
  }

  ngOnInit(): void {
    if (!this.userId) {
      this.router.navigate(['/login']);
      return;
    }

    // Start expiry timer
    this.expiryInterval = setInterval(() => {
      this.expiresIn--;
      if (this.expiresIn <= 0) {
        this.error = 'OTP expired. Please request a new code.';
        clearInterval(this.expiryInterval);
      }
    }, 1000);
  }

  ngOnDestroy(): void {
    if (this.expiryInterval) {
      clearInterval(this.expiryInterval);
    }
    if (this.cooldownInterval) {
      clearInterval(this.cooldownInterval);
    }
  }

  onSubmit(): void {
    if (this.otpCode.length !== 6) {
      this.error = 'Please enter a valid 6-digit code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyOTP(this.userId, this.otpCode).subscribe({
      next: () => {
        this.loading = false;
        this.success = 'OTP verified successfully!';
        setTimeout(() => {
          this.router.navigate(['/dashboard']);
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid OTP. Please try again.';
      },
    });
  }

  resendOTP(): void {
    if (this.resendCooldown > 0) return;

    this.loading = true;
    this.error = '';

    // Call resend endpoint (email)
    this.authService.sendOTP(this.userId, '').subscribe({
      next: () => {
        this.loading = false;
        this.success = 'New OTP sent!';
        this.expiresIn = 300;
        this.resendCooldown = 30;

        this.cooldownInterval = setInterval(() => {
          this.resendCooldown--;
          if (this.resendCooldown <= 0) {
            clearInterval(this.cooldownInterval);
          }
        }, 1000);
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to resend OTP';
      },
    });
  }
}
