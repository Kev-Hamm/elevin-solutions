import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-totp-setup',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="totp-container">
      <div class="totp-card">
        <h2>Set Up Authenticator</h2>

        <div *ngIf="error" class="alert alert-error">{{ error }}</div>
        <div *ngIf="success" class="alert alert-success">{{ success }}</div>

        <div *ngIf="!verified && qrCodeUrl" class="setup-section">
          <p class="step-number">Step 1: Scan QR Code</p>
          <p class="description">
            Use Google Authenticator, Authy, or Microsoft Authenticator to scan this QR code:
          </p>

          <div class="qr-code-placeholder">
            <p>📱 QR Code</p>
            <code>{{ secret }}</code>
          </div>

          <p class="description">
            Can't scan? Enter this code manually:
          </p>
          <code class="secret-code">{{ secret }}</code>

          <p class="step-number mt-2">Step 2: Verify Code</p>
          <p class="description">
            Enter the 6-digit code from your authenticator app:
          </p>

          <form (ngSubmit)="verifyCode()">
            <div class="form-group">
              <input
                type="text"
                [(ngModel)]="verificationCode"
                name="verificationCode"
                maxlength="6"
                placeholder="000000"
                inputmode="numeric"
                required
              />
            </div>

            <button type="submit" [disabled]="loading || verificationCode.length !== 6">
              {{ loading ? 'Verifying...' : 'Verify Code' }}
            </button>
          </form>
        </div>

        <div *ngIf="verified && backupCodes.length > 0" class="backup-section">
          <p class="step-number">Step 3: Save Backup Codes</p>
          <p class="warning">
            ⚠️ Save these backup codes in a safe place. You can use them to log in if you lose access to your authenticator app.
          </p>

          <div class="backup-codes">
            <code *ngFor="let code of backupCodes">{{ code }}</code>
          </div>

          <p class="print-note">
            💡 Tip: Print or save these codes somewhere secure.
          </p>

          <button (click)="copyBackupCodes()" type="button">
            Copy Backup Codes
          </button>

          <button (click)="finish()" type="button" class="primary">
            Finish Setup
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .totp-container {
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 1rem;
    }

    .totp-card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
      width: 100%;
      max-width: 500px;
    }

    h2 {
      text-align: center;
      color: #667eea;
      margin-bottom: 1.5rem;
    }

    .setup-section,
    .backup-section {
      margin-bottom: 2rem;
    }

    .step-number {
      font-weight: 600;
      color: #333;
      margin-bottom: 0.5rem;
    }

    .description {
      color: #666;
      font-size: 0.95rem;
      margin-bottom: 1rem;
    }

    .qr-code-placeholder {
      background: #f5f5f5;
      border: 2px dashed #ddd;
      border-radius: 4px;
      padding: 2rem;
      text-align: center;
      margin-bottom: 1.5rem;

      p {
        font-size: 2rem;
        margin-bottom: 0.5rem;
      }
    }

    code {
      display: block;
      background: #f5f5f5;
      padding: 0.75rem;
      border-radius: 4px;
      font-family: 'Courier New', monospace;
      word-break: break-all;
      margin-bottom: 1rem;
    }

    .secret-code {
      font-size: 1.2rem;
      letter-spacing: 2px;
      text-align: center;
    }

    .form-group {
      margin-bottom: 1rem;
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

    .warning {
      background: #fff3cd;
      border: 1px solid #ffc107;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 1rem;
      color: #856404;
    }

    .backup-codes {
      background: #f5f5f5;
      border: 1px solid #ddd;
      border-radius: 4px;
      padding: 1rem;
      margin-bottom: 1rem;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 0.5rem;

      code {
        background: white;
        padding: 0.5rem;
        margin: 0;
        text-align: center;
        border: 1px solid #ddd;
      }
    }

    .print-note {
      color: #666;
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    button {
      width: 100%;
      padding: 0.75rem;
      background: #667eea;
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

      &.primary {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
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

    .mt-2 {
      margin-top: 1rem;
    }
  `]
})
export class TOTPSetupComponent implements OnInit {
  qrCodeUrl = '';
  secret = '';
  verificationCode = '';
  backupCodes: string[] = [];
  verified = false;
  loading = false;
  error = '';
  success = '';

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.startEnrollment();
  }

  startEnrollment(): void {
    this.loading = true;
    this.error = '';

    this.authService.enrollTOTP().subscribe({
      next: (response) => {
        this.loading = false;
        this.qrCodeUrl = response.qrCode;
        this.secret = response.secret;
        this.backupCodes = response.backupCodes;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Failed to start TOTP enrollment';
      },
    });
  }

  verifyCode(): void {
    if (this.verificationCode.length !== 6) {
      this.error = 'Please enter a valid 6-digit code';
      return;
    }

    this.loading = true;
    this.error = '';

    this.authService.verifyTOTPSetup(this.verificationCode).subscribe({
      next: (response) => {
        this.loading = false;
        this.verified = true;
        this.success = 'Authenticator verified!';
        this.backupCodes = response.backupCodes;
      },
      error: (err) => {
        this.loading = false;
        this.error = err.error?.message || 'Invalid code. Please try again.';
      },
    });
  }

  copyBackupCodes(): void {
    const text = this.backupCodes.join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.success = 'Backup codes copied to clipboard!';
      setTimeout(() => {
        this.success = '';
      }, 3000);
    });
  }

  finish(): void {
    this.router.navigate(['/dashboard']);
  }
}
