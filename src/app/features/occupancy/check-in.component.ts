import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { forkJoin } from 'rxjs';
import { ApiService, Client, Unit } from '../../core/services/api.service';

@Component({
  selector: 'app-check-in',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-route-shell checkins-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Placement workflow</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Placement workflow</p>
            <h1>Check-ins</h1>
            <p>Assign a client to an available housing unit and record the placement start date.</p>
          </div>
          <div class="hero-actions"><a routerLink="/units" class="pill-button secondary">View units</a></div>
        </section>

        <div class="route-layout support-right">
          <section class="surface-card checkin-workflow-card">
            <ol class="checkin-step-rail" aria-label="Check-in steps">
              <li><strong>1</strong><span>Select client</span></li>
              <li><strong>2</strong><span>Choose unit</span></li>
              <li><strong>3</strong><span>Confirm start date</span></li>
            </ol>

            <div *ngIf="loadingLists" class="loading-state" aria-live="polite">Loading clients and units...</div>
            <div *ngIf="listError" class="error-banner" role="alert">{{ listError }}</div>

            <div *ngIf="!loadingLists && clients.length === 0" class="empty-state">
              <h3>Add a client before starting check-in.</h3>
              <a routerLink="/clients/new" class="pill-button primary">Add client</a>
            </div>
            <div *ngIf="!loadingLists && availableUnits.length === 0" class="empty-state">
              <h3>No available units are currently listed.</h3>
              <a routerLink="/units" class="pill-button secondary">View units</a>
            </div>

            <form (ngSubmit)="onSubmit()" *ngIf="!loadingLists && clients.length > 0 && availableUnits.length > 0">
              <div class="checkin-field-grid">
                <div class="form-group">
                  <label for="clientId">Client</label>
                  <select id="clientId" [(ngModel)]="form.clientId" name="clientId" required>
                    <option [ngValue]="''" disabled>Select a client</option>
                    <option *ngFor="let c of clients" [ngValue]="c.id">{{ c.firstName }} {{ c.lastName }}</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="unitId">Unit</label>
                  <select id="unitId" [(ngModel)]="form.unitId" name="unitId" required>
                    <option [ngValue]="''" disabled>Select a unit</option>
                    <option *ngFor="let u of availableUnits" [ngValue]="u.id">{{ u.name }} — {{ u.available }} available</option>
                  </select>
                </div>

                <div class="form-group">
                  <label for="startDate">Start date</label>
                  <input id="startDate" type="date" [(ngModel)]="form.startDate" name="startDate" required />
                </div>
              </div>

              <div *ngIf="success" class="success-banner checkin-success-card" role="status">
                Client checked in successfully.
                <button type="button" class="pill-button secondary" (click)="resetForm()">Check in another client</button>
                <a routerLink="/units" class="pill-button secondary">View units</a>
              </div>
              <div *ngIf="error" class="error-banner" role="alert">{{ error }}</div>

              <button class="pill-button primary" type="submit" [disabled]="loading || !form.clientId || !form.unitId || !form.startDate">
                {{ loading ? 'Completing check-in...' : 'Complete check-in' }}
              </button>
            </form>
          </section>

          <aside class="sage-panel checkin-readiness-panel">
            <p class="eyebrow">Before check-in</p>
            <h2>Readiness checklist</h2>
            <ul><li>Verify resident profile.</li><li>Confirm unit availability.</li><li>Confirm placement start date.</li></ul>
          </aside>
        </div>
      </main>
    </div>
  `,
})
export class CheckInComponent {
  clients: Client[] = [];
  units: Unit[] = [];
  form = { clientId: '', unitId: '', startDate: '' };
  loading = false;
  loadingLists = true;
  listError = '';
  error = '';
  success = false;

  constructor(private api: ApiService) {
    this.loadLists();
  }

  get availableUnits(): Unit[] {
    return this.units.filter(u => Number(u.available) > 0);
  }

  loadLists(): void {
    this.loadingLists = true;
    this.listError = '';
    forkJoin({ clients: this.api.getClients(), units: this.api.getUnits() }).subscribe({
      next: ({ clients, units }) => { this.clients = clients; this.units = units; this.loadingLists = false; },
      error: (err) => { this.listError = err.error?.message || 'Unable to load clients and units right now.'; this.loadingLists = false; }
    });
  }

  resetForm(): void {
    this.form = { clientId: '', unitId: '', startDate: '' };
    this.success = false;
    this.error = '';
  }

  onSubmit(): void {
    this.loading = true; this.error = ''; this.success = false;
    this.api.createOccupancy(this.form).subscribe({
      next: () => { this.loading = false; this.success = true; },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Unable to complete check-in right now.'; }
    });
  }
}
