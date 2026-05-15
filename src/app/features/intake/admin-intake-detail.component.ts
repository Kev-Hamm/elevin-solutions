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
    <div class="admin-route-shell intake-admin-page intake-detail-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Masked intake detail</span>
        <a routerLink="/intake-submissions" class="pill-button secondary">Back to intake submissions</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Masked intake queue</p>
            <h1>Intake submission detail</h1>
            <p>SSN last four stays masked by default. Admin reveal is explicit, limited to stored last four digits, and clears automatically after 30 seconds.</p>
          </div>
          <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
        </section>

        <div *ngIf="loadError" class="error-banner" role="alert">{{ loadError }}</div>
        <div *ngIf="revealError" class="error-banner" role="alert">{{ revealError }}</div>
        <div *ngIf="pdfError" class="error-banner" role="alert">{{ pdfError }}</div>
        <div class="surface-card loading-state" *ngIf="loading" aria-live="polite">Loading intake submission...</div>

        <div class="route-layout support-right" *ngIf="!loading && submission as current">
          <section class="surface-card">
            <p class="eyebrow">Submission summary</p>
            <h2>{{ current.firstName || 'Applicant' }} {{ current.lastName || '' }}</h2>
            <dl class="detail-grid">
              <div class="detail-row"><dt>First name</dt><dd>{{ current.firstName || '—' }}</dd></div>
              <div class="detail-row"><dt>Last name</dt><dd>{{ current.lastName || '—' }}</dd></div>
              <div class="detail-row"><dt>Date of birth</dt><dd>{{ current.dateOfBirth || '—' }}</dd></div>
              <div class="detail-row"><dt>Submitted</dt><dd>{{ formatDateTime(current.submittedAt) }}</dd></div>
              <div class="detail-row"><dt>SSN</dt><dd><span class="masked-ssn-chip">{{ displayedSsnForView }}</span></dd></div>
            </dl>
          </section>

          <aside class="surface-card sensitive-actions-card">
            <p class="eyebrow">Sensitive actions</p>
            <h2>Printable intake PDF</h2>
            <p class="privacy-note pdf-warning-panel">Staff-only printable PDF with sensitive intake information. Print only when needed for the in-person workflow, and store any printed copy according to policy. Only use printable or reveal actions when required for staff workflow.</p>
            <button type="button" class="pill-button primary" (click)="generatePrintablePdf()" [disabled]="pdfLoading">
              {{ pdfLoading ? 'Generating printable PDF...' : 'Generate printable PDF' }}
            </button>

            <div class="security-note">
              <h3>SSN last four</h3>
              <p>Reveal remains admin-only and clears automatically.</p>
              <button *ngIf="isAdmin && current.ssn" type="button" class="pill-button secondary" (click)="revealSsnLast4()" [disabled]="revealing">
                {{ revealing ? 'Revealing...' : (isSsnRevealed ? 'View SSN last 4 again' : 'View SSN last 4') }}
              </button>
              <span *ngIf="isSsnRevealed" class="reveal-countdown-chip" aria-live="polite">Clears in {{ revealCountdownSeconds }}s</span>
            </div>
          </aside>
        </div>
      </main>
    </div>
  `,
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

  get displayedSsnForView(): string {
    if (!this.displayedSsn || this.displayedSsn === '—') return '—';
    return this.displayedSsn;
  }

  ngOnInit(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isAdmin = user?.role === 'admin';
      if (!this.isAdmin && this.isSsnRevealed) this.clearRevealedSsn();
    });
    const currentUser = this.authService.getCurrentUserSync();
    if (!currentUser) {
      this.authService.getCurrentUser().subscribe({ next: ({ user }) => { this.isAdmin = user.role === 'admin'; }, error: () => this.router.navigate(['/login']) });
    } else {
      this.isAdmin = currentUser.role === 'admin';
    }
    this.loadSubmission();
  }

  ngOnDestroy(): void { this.clearRevealTimers(); this.userSubscription?.unsubscribe(); }

  generatePrintablePdf(): void {
    if (!this.submission || this.pdfLoading) return;
    this.pdfLoading = true; this.pdfError = '';
    this.adminIntakeService.downloadPdf(this.submission.id).subscribe({
      next: (pdfBlob) => { this.pdfLoading = false; this.triggerPdfDownload(pdfBlob, this.submission?.id || 'intake-submission'); },
      error: async (err) => { this.pdfLoading = false; this.pdfError = await this.getPdfErrorMessage(err); },
    });
  }

  revealSsnLast4(): void {
    if (!this.submission || !this.isAdmin || this.revealing) return;
    this.revealing = true; this.revealError = '';
    this.adminIntakeService.revealSsn(this.submission.id).subscribe({
      next: ({ ssn }) => { this.revealing = false; this.displayedSsn = ssn; this.isSsnRevealed = true; this.startRevealWindow(); },
      error: (err) => { this.revealing = false; this.revealError = err.error?.message || 'Unable to reveal SSN last 4 right now.'; },
    });
  }

  formatDateTime(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }

  private loadSubmission(): void {
    const submissionId = this.route.snapshot.paramMap.get('id');
    if (!submissionId) { this.loading = false; this.loadError = 'Missing intake submission ID.'; return; }
    this.loading = true; this.loadError = ''; this.revealError = '';
    this.adminIntakeService.getSubmission(submissionId).subscribe({
      next: ({ submission }) => { this.submission = submission; this.displayedSsn = this.maskLastFour(submission.ssn); this.loading = false; },
      error: (err) => { this.loading = false; this.loadError = err.error?.message || 'Unable to load the intake submission right now.'; },
    });
  }

  private async getPdfErrorMessage(err: unknown): Promise<string> {
    const fallback = 'Unable to generate the printable PDF right now.';
    if (err instanceof HttpErrorResponse) {
      if (err.error instanceof Blob) {
        const blobText = await err.error.text();
        try { const parsed = JSON.parse(blobText) as { message?: unknown }; return typeof parsed.message === 'string' && parsed.message.trim() ? parsed.message : fallback; }
        catch { return blobText.trim() || fallback; }
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
    anchor.href = url; anchor.download = `elevin-intake-${submissionId}.pdf`; anchor.rel = 'noopener';
    document.body.appendChild(anchor); anchor.click(); anchor.remove(); URL.revokeObjectURL(url);
  }

  private startRevealWindow(): void {
    this.clearRevealTimers(); this.revealDeadline = Date.now() + this.revealWindowMs; this.revealCountdownSeconds = this.revealWindowMs / 1000;
    this.revealTimeoutId = setTimeout(() => this.clearRevealedSsn(), this.revealWindowMs);
    this.countdownSubscription = interval(1000).subscribe(() => {
      const secondsRemaining = Math.max(0, Math.ceil((this.revealDeadline - Date.now()) / 1000));
      this.revealCountdownSeconds = secondsRemaining;
      if (secondsRemaining === 0) { this.countdownSubscription?.unsubscribe(); this.countdownSubscription = null; }
    });
  }

  private clearRevealedSsn(): void { this.clearRevealTimers(); this.isSsnRevealed = false; this.revealCountdownSeconds = 0; this.displayedSsn = this.maskLastFour(this.submission?.ssn); }
  private maskLastFour(value: unknown): string { return typeof value === 'string' && value.length > 0 ? `***-**-${value.slice(-4)}` : '—'; }
  private clearRevealTimers(): void { if (this.revealTimeoutId) { clearTimeout(this.revealTimeoutId); this.revealTimeoutId = null; } this.countdownSubscription?.unsubscribe(); this.countdownSubscription = null; }
}
