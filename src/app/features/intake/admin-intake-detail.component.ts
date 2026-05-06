import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { Subscription, interval } from 'rxjs';
import { AdminIntakeService, IntakeSubmissionRecord } from '../../core/services/admin-intake.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin-intake-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="intake-page">
      <div class="page-header">
        <div>
          <a routerLink="/intake-submissions" class="back-link">← Back to intake submissions</a>
          <h1>Intake submission detail</h1>
          <p>SSN last 4 stays masked by default. Admin reveal is limited to the stored last 4 digits and clears automatically after 30 seconds.</p>
        </div>
      </div>

      <div *ngIf="loadError" class="banner error">{{ loadError }}</div>
      <div *ngIf="revealError" class="banner error">{{ revealError }}</div>
      <div *ngIf="pdfError" class="banner error">{{ pdfError }}</div>

      <div class="card" *ngIf="loading">Loading intake submission...</div>

      <div class="card" *ngIf="!loading && submission as current">
        <div class="pdf-actions" aria-label="Printable intake PDF actions">
          <div>
            <h2>Printable intake PDF</h2>
            <p>
              Staff-only printable PDF with sensitive intake information. Print only when needed for the in-person workflow,
              and store any printed copy according to policy.
            </p>
          </div>
          <button
            type="button"
            class="primary-btn"
            (click)="generatePrintablePdf()"
            [disabled]="pdfLoading"
          >
            {{ pdfLoading ? 'Generating printable PDF...' : 'Generate printable PDF' }}
          </button>
        </div>

        <div class="detail-grid">
          <div class="detail-row"><span class="label">First name</span><span>{{ current.firstName || '—' }}</span></div>
          <div class="detail-row"><span class="label">Last name</span><span>{{ current.lastName || '—' }}</span></div>
          <div class="detail-row"><span class="label">Date of birth</span><span>{{ current.dateOfBirth || '—' }}</span></div>
          <div class="detail-row"><span class="label">Submitted</span><span>{{ formatDateTime(current.submittedAt) }}</span></div>
          <div class="detail-row ssn-row">
            <span class="label">SSN</span>
            <div class="ssn-value-block">
              <span class="ssn-value">{{ displayedSsn }}</span>
              <button
                *ngIf="isAdmin && current.ssn"
                type="button"
                class="secondary-btn"
                (click)="revealSsnLast4()"
                [disabled]="revealing"
              >
                {{ revealing ? 'Revealing...' : (isSsnRevealed ? 'Reveal again' : 'View SSN last 4') }}
              </button>
              <span *ngIf="isSsnRevealed" class="countdown">Clears in {{ revealCountdownSeconds }}s</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .intake-page { max-width: 900px; margin: 0 auto; padding: 2rem 1rem 3rem; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #667eea; text-decoration: none; font-weight: 600; }
    h1 { margin: .5rem 0; color: #1f2937; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 23, 42, .08); padding: 1.5rem; }
    .banner.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 10px; padding: .9rem 1rem; margin-bottom: 1rem; }
    .pdf-actions { display: flex; justify-content: space-between; gap: 1rem; align-items: center; border: 1px solid #c7d2fe; background: #eef2ff; border-radius: 12px; padding: 1rem; margin-bottom: 1.25rem; }
    .pdf-actions h2 { margin: 0 0 .35rem; color: #312e81; font-size: 1.1rem; }
    .pdf-actions p { margin: 0; color: #4338ca; line-height: 1.45; }
    .primary-btn { border: 0; border-radius: 8px; cursor: pointer; font-weight: 800; padding: .85rem 1rem; background: #4f46e5; color: white; white-space: nowrap; }
    .primary-btn:disabled { opacity: .65; cursor: wait; }
    .detail-grid { display: grid; gap: 1rem; }
    .detail-row { display: flex; justify-content: space-between; gap: 1rem; padding-bottom: 1rem; border-bottom: 1px solid #e5e7eb; }
    .detail-row:last-child { border-bottom: 0; padding-bottom: 0; }
    .label { color: #475569; font-weight: 700; min-width: 180px; }
    .ssn-row { align-items: flex-start; }
    .ssn-value-block { display: flex; flex-direction: column; align-items: flex-start; gap: .75rem; }
    .ssn-value { font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace; font-size: 1.05rem; }
    .secondary-btn { border: 0; border-radius: 8px; cursor: pointer; font-weight: 700; padding: .8rem 1rem; background: #eef2ff; color: #4338ca; }
    .secondary-btn:disabled { opacity: .65; cursor: not-allowed; }
    .countdown { color: #92400e; background: #fef3c7; border-radius: 999px; padding: .35rem .7rem; font-size: .9rem; font-weight: 700; }
    @media (max-width: 720px) {
      .pdf-actions { flex-direction: column; align-items: stretch; }
      .detail-row { flex-direction: column; }
    }
  `],
})
export class AdminIntakeDetailComponent implements OnInit, OnDestroy {
  readonly revealWindowMs = 30000;

  submission: IntakeSubmissionRecord | null = null;
  loading = true;
  revealing = false;
  loadError = '';
  revealError = '';
  pdfError = '';
  pdfLoading = false;
  isAdmin = false;
  displayedSsn = '—';
  revealCountdownSeconds = 0;
  isSsnRevealed = false;

  private revealTimeoutId: ReturnType<typeof setTimeout> | null = null;
  private countdownSubscription: Subscription | null = null;
  private revealDeadline = 0;
  private userSubscription: Subscription | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private adminIntakeService: AdminIntakeService,
    private authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin && this.isSsnRevealed) {
        this.clearRevealedSsn();
      }
    });

    const currentUser = this.authService.getCurrentUserSync();
    if (!currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: ({ user }) => {
          this.isAdmin = user.role === 'admin';
        },
        error: () => this.router.navigate(['/login']),
      });
    } else {
      this.isAdmin = currentUser.role === 'admin';
    }

    this.loadSubmission();
  }

  ngOnDestroy(): void {
    this.clearRevealTimers();
    this.userSubscription?.unsubscribe();
  }

  generatePrintablePdf(): void {
    if (!this.submission || this.pdfLoading) {
      return;
    }

    this.pdfLoading = true;
    this.pdfError = '';

    this.adminIntakeService.downloadPdf(this.submission.id).subscribe({
      next: (pdfBlob) => {
        this.pdfLoading = false;
        this.triggerPdfDownload(pdfBlob, this.submission?.id || 'intake-submission');
      },
      error: async (err) => {
        this.pdfLoading = false;
        this.pdfError = await this.getPdfErrorMessage(err);
      },
    });
  }

  revealSsnLast4(): void {
    if (!this.submission || !this.isAdmin || this.revealing) {
      return;
    }

    this.revealing = true;
    this.revealError = '';

    this.adminIntakeService.revealSsn(this.submission.id).subscribe({
      next: ({ ssn }) => {
        this.revealing = false;
        this.displayedSsn = ssn;
        this.isSsnRevealed = true;
        this.startRevealWindow();
      },
      error: (err) => {
        this.revealing = false;
        this.revealError = err.error?.message || 'Unable to reveal SSN last 4 right now.';
      },
    });
  }

  formatDateTime(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) {
      return '—';
    }

    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  private loadSubmission(): void {
    const submissionId = this.route.snapshot.paramMap.get('id');
    if (!submissionId) {
      this.loading = false;
      this.loadError = 'Missing intake submission ID.';
      return;
    }

    this.loading = true;
    this.loadError = '';
    this.revealError = '';

    this.adminIntakeService.getSubmission(submissionId).subscribe({
      next: ({ submission }) => {
        this.submission = submission;
        this.displayedSsn = submission.ssn || '—';
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.loadError = err.error?.message || 'Unable to load the intake submission right now.';
      },
    });
  }

  private async getPdfErrorMessage(err: unknown): Promise<string> {
    const fallback = 'Unable to generate the printable PDF right now.';

    if (err instanceof HttpErrorResponse) {
      if (err.error instanceof Blob) {
        const blobText = await err.error.text();
        try {
          const parsed = JSON.parse(blobText) as { message?: unknown };
          return typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message : fallback;
        } catch {
          return blobText.trim() || fallback;
        }
      }

      const message = (err.error as { message?: unknown } | null | undefined)?.message;
      return typeof message === 'string' && message.trim() ? message : fallback;
    }

    const message = (err as { error?: { message?: unknown } } | null | undefined)?.error?.message;
    return typeof message === 'string' && message.trim() ? message : fallback;
  }

  private triggerPdfDownload(pdfBlob: Blob, submissionId: string): void {
    const url = URL.createObjectURL(pdfBlob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `elevin-intake-${submissionId}.pdf`;
    anchor.rel = 'noopener';
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  private startRevealWindow(): void {
    this.clearRevealTimers();
    this.revealDeadline = Date.now() + this.revealWindowMs;
    this.revealCountdownSeconds = this.revealWindowMs / 1000;
    this.revealTimeoutId = setTimeout(() => this.clearRevealedSsn(), this.revealWindowMs);
    this.countdownSubscription = interval(1000).subscribe(() => {
      const secondsRemaining = Math.max(0, Math.ceil((this.revealDeadline - Date.now()) / 1000));
      this.revealCountdownSeconds = secondsRemaining;
      if (secondsRemaining === 0) {
        this.countdownSubscription?.unsubscribe();
        this.countdownSubscription = null;
      }
    });
  }

  private clearRevealedSsn(): void {
    this.clearRevealTimers();
    this.isSsnRevealed = false;
    this.revealCountdownSeconds = 0;
    this.displayedSsn = this.submission?.ssn || '—';
  }

  private clearRevealTimers(): void {
    if (this.revealTimeoutId) {
      clearTimeout(this.revealTimeoutId);
      this.revealTimeoutId = null;
    }

    this.countdownSubscription?.unsubscribe();
    this.countdownSubscription = null;
  }
}
