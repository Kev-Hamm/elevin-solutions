import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminIntakeService, IntakeSubmissionRecord } from '../../core/services/admin-intake.service';

@Component({
  selector: 'app-admin-intake-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="intake-page">
      <div class="page-header">
        <div>
          <a routerLink="/dashboard" class="back-link">← Back to dashboard</a>
          <h1>Intake submissions</h1>
          <p>Review masked intake records. SSNs stay limited to last four digits unless an admin opens a detail view and explicitly reveals them.</p>
        </div>
        <button type="button" class="secondary-btn" (click)="loadSubmissions()" [disabled]="loading">
          {{ loading ? 'Refreshing...' : 'Refresh' }}
        </button>
      </div>

      <div *ngIf="errorMessage" class="banner error">{{ errorMessage }}</div>

      <div class="card">
        <div *ngIf="loading" class="empty-state">Loading intake submissions...</div>

        <div *ngIf="!loading && submissions.length === 0" class="empty-state">
          No intake submissions found.
        </div>

        <div *ngIf="!loading && submissions.length > 0" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Submitted</th>
                <th>Name</th>
                <th>Date of birth</th>
                <th>SSN (last 4)</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let submission of submissions">
                <td>{{ formatDateTime(submission.submittedAt) }}</td>
                <td>{{ submission.firstName }} {{ submission.lastName }}</td>
                <td>{{ submission.dateOfBirth || '—' }}</td>
                <td>{{ submission.ssn || '—' }}</td>
                <td class="actions-cell">
                  <a [routerLink]="['/intake-submissions', submission.id]" class="detail-link">View details</a>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .intake-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem 3rem; }
    .page-header { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; margin-bottom: 1.5rem; }
    .back-link { color: #667eea; text-decoration: none; font-weight: 600; }
    h1 { margin: .5rem 0; color: #1f2937; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 23, 42, .08); padding: 1.25rem; }
    .secondary-btn { border: 0; border-radius: 8px; cursor: pointer; font-weight: 700; padding: .85rem 1.1rem; background: #eef2ff; color: #4338ca; }
    .secondary-btn:disabled { opacity: .65; cursor: not-allowed; }
    .banner.error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; border-radius: 10px; padding: .9rem 1rem; margin-bottom: 1rem; }
    .empty-state { padding: 1.5rem 1rem; color: #6b7280; text-align: center; border: 1px dashed #d1d5db; border-radius: 10px; }
    .table-wrap { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; }
    th, td { padding: .9rem .8rem; border-bottom: 1px solid #e5e7eb; text-align: left; }
    th { color: #475569; font-size: .92rem; }
    .actions-cell { text-align: right; }
    .detail-link { color: #4338ca; font-weight: 700; text-decoration: none; }
    @media (max-width: 720px) {
      .page-header { flex-direction: column; }
      .actions-cell { text-align: left; }
    }
  `],
})
export class AdminIntakeListComponent implements OnInit {
  submissions: IntakeSubmissionRecord[] = [];
  loading = false;
  errorMessage = '';

  constructor(private adminIntakeService: AdminIntakeService) {}

  ngOnInit(): void {
    this.loadSubmissions();
  }

  loadSubmissions(): void {
    this.loading = true;
    this.errorMessage = '';

    this.adminIntakeService.listSubmissions().subscribe({
      next: ({ submissions }) => {
        this.submissions = submissions;
        this.loading = false;
      },
      error: (err) => {
        this.loading = false;
        this.errorMessage = err.error?.message || 'Unable to load intake submissions right now.';
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
}
