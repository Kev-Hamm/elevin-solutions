import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminIntakeService, IntakeSubmissionRecord } from '../../core/services/admin-intake.service';

@Component({
  selector: 'app-admin-intake-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-route-shell intake-admin-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Masked intake queue</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Masked intake queue</p>
            <h1>Intake submissions</h1>
            <p>Review submitted intake records with SSN protected by default.</p>
            <span class="status-chip restricted">SSN masked by default</span>
          </div>
          <button type="button" class="pill-button secondary" (click)="loadSubmissions()" [disabled]="loading">{{ loading ? 'Refreshing...' : 'Refresh' }}</button>
        </section>

        <div *ngIf="errorMessage" class="error-banner" role="alert">{{ errorMessage }}</div>

        <section class="surface-card intake-queue-card">
          <div *ngIf="loading" class="loading-state" aria-live="polite">Loading intake submissions...</div>
          <div *ngIf="!loading && submissions.length === 0" class="empty-state">
            <h3>No intake submissions found.</h3>
            <p>New public intake forms will appear here after submission.</p>
          </div>

          <div *ngIf="!loading && submissions.length > 0" class="data-table-wrap">
            <table class="admin-table">
              <thead><tr><th>Submitted</th><th>Applicant</th><th>Date of birth</th><th>SSN</th><th>Action</th></tr></thead>
              <tbody>
                <tr *ngFor="let submission of submissions">
                  <td>{{ formatDateTime(submission.submittedAt) }}</td>
                  <td><strong>{{ submission.firstName }} {{ submission.lastName }}</strong></td>
                  <td>{{ submission.dateOfBirth || '—' }}</td>
                  <td><span class="masked-ssn-chip">{{ maskedSsn(submission.ssn) }}</span></td>
                  <td><a [routerLink]="['/intake-submissions', submission.id]" class="pill-button secondary small">View details</a></td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="mobile-record-list" *ngIf="!loading && submissions.length > 0">
            <article class="record-card intake-record-card" *ngFor="let submission of submissions">
              <h3>{{ submission.firstName }} {{ submission.lastName }}</h3>
              <p><span>Submitted</span>{{ formatDateTime(submission.submittedAt) }}</p>
              <p><span>Date of birth</span>{{ submission.dateOfBirth || '—' }}</p>
              <p><span>SSN</span><span class="masked-ssn-chip">{{ maskedSsn(submission.ssn) }}</span></p>
              <a [routerLink]="['/intake-submissions', submission.id]" class="pill-button secondary">View details</a>
            </article>
          </div>
        </section>
      </main>
    </div>
  `,
})
export class AdminIntakeListComponent implements OnInit {
  submissions: IntakeSubmissionRecord[] = [];
  loading = false;
  errorMessage = '';

  constructor(private adminIntakeService: AdminIntakeService) {}

  ngOnInit(): void { this.loadSubmissions(); }

  loadSubmissions(): void {
    this.loading = true;
    this.errorMessage = '';
    this.adminIntakeService.listSubmissions().subscribe({
      next: ({ submissions }) => { this.submissions = submissions; this.loading = false; },
      error: (err) => { this.loading = false; this.errorMessage = err.error?.message || 'Unable to load intake submissions right now.'; },
    });
  }

  maskedSsn(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) return '—';
    const last4 = value.slice(-4);
    return `•••-••-${last4}`;
  }

  formatDateTime(value: unknown): string {
    if (typeof value !== 'string' || value.length === 0) return '—';
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? value : parsed.toLocaleString();
  }
}
