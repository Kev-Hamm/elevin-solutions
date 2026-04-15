import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService, Client, Unit } from '../../core/services/api.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="container">
      <h1>Check-In</h1>
      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-row">
            <label>Client</label>
            <select [(ngModel)]="form.clientId" name="clientId" required>
              <option [ngValue]="''" disabled>Select a client</option>
              <option *ngFor="let c of clients" [ngValue]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
            </select>
          </div>

          <div class="form-row">
            <label>Unit</label>
            <select [(ngModel)]="form.unitId" name="unitId" required>
              <option [ngValue]="''" disabled>Select a unit</option>
              <option *ngFor="let u of units" [ngValue]="u.id">{{ u.name }} (available: {{ u.available }})</option>
            </select>
          </div>

          <div class="form-row">
            <label>Start Date</label>
            <input type="date" [(ngModel)]="form.startDate" name="startDate" required />
          </div>

          <div *ngIf="success" class="success">Client checked in successfully.</div>
          <div *ngIf="error" class="alert">{{ error }}</div>

          <button class="btn" type="submit" [disabled]="loading">{{ loading ? 'Checking In...' : 'Check In' }}</button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 800px; margin: 2rem auto; padding: 0 1rem; }
    .card { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
    .form-row { margin-bottom: 1rem; display: flex; flex-direction: column; }
    label { font-weight: 500; color: #333; margin-bottom: .5rem; }
    select, input { padding: .75rem; border: 1px solid #ddd; border-radius: 4px; }
    .btn { padding: .75rem 1.5rem; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color: #fff; border: 0; border-radius: 4px; cursor: pointer; }
    .alert { padding: 1rem; background: #fee; color: #900; border: 1px solid #fcc; border-radius: 6px; margin-top: 1rem; }
    .success { padding: 1rem; background: #eefcee; color: #0a8025; border: 1px solid #bbf0c5; border-radius: 6px; margin-top: 1rem; }
  `]
})
export class CheckInComponent {
  clients: Client[] = [];
  units: Unit[] = [];
  form = { clientId: '', unitId: '', startDate: '' };
  loading = false;
  error = '';
  success = false;

  constructor(private api: ApiService) {
    this.api.getClients().subscribe({ next: (d) => this.clients = d });
    this.api.getUnits().subscribe({ next: (d) => this.units = d });
  }

  onSubmit(): void {
    this.loading = true; this.error = ''; this.success = false;
    this.api.createOccupancy(this.form).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Failed to check in'; }
    });
  }
}
