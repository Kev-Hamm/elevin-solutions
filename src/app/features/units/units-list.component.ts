import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Unit } from '../../core/services/api.service';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="admin-route-shell units-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Housing capacity</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Housing capacity</p>
            <h1>Units</h1>
            <p>See the current three-unit room plan and bed capacity before starting a placement.</p>
          </div>
          <div class="hero-actions">
            <a routerLink="/occupancies" class="pill-button primary">Start check-in</a>
            <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
          </div>
        </section>

        <section class="unit-summary-strip" aria-label="Unit availability summary">
          <article class="surface-card summary-tile"><span>Total units</span><strong>{{ units.length }}</strong></article>
          <article class="surface-card summary-tile"><span>Total capacity</span><strong>{{ totalCapacity }}</strong></article>
          <article class="surface-card summary-tile"><span>Available beds</span><strong>{{ totalAvailable }}</strong></article>
        </section>

        <div class="route-layout support-right">
          <section class="surface-card unit-availability-card">
            <div class="section-header">
              <div><p class="eyebrow">Inventory</p><h2>Unit availability</h2></div>
              <button type="button" class="pill-button secondary" (click)="loadUnits()" [disabled]="loading">{{ loading ? 'Refreshing...' : 'Refresh' }}</button>
            </div>
            <p class="inventory-note" *ngIf="inventoryNote">{{ inventoryNote }}</p>

            <div *ngIf="loading" class="loading-state" aria-live="polite">Loading unit availability...</div>
            <div *ngIf="error" class="error-banner" role="alert">{{ error }}</div>
            <div *ngIf="!loading && !error && units.length === 0" class="empty-state">
              <h3>No units found.</h3>
              <p>Units will appear here once housing inventory is configured.</p>
            </div>

            <div class="data-table-wrap" *ngIf="!loading && !error && units.length > 0">
              <table class="admin-table">
                <thead><tr><th>Unit</th><th>Capacity</th><th>Available</th><th>Status</th><th>Room plan</th></tr></thead>
                <tbody>
                  <tr *ngFor="let u of units">
                    <td><strong>{{ u.name }}</strong></td><td>{{ u.capacity }}</td><td>{{ u.available }}</td>
                    <td><span class="status-chip" [ngClass]="statusClass(u)">{{ statusLabel(u) }}</span></td>
                    <td>{{ u.notes || 'Ready for staff review' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-record-list" *ngIf="!loading && !error && units.length > 0">
              <article class="record-card unit-record-card" *ngFor="let u of units">
                <h3>{{ u.name }}</h3>
                <p><span>Available</span>{{ u.available }} available of {{ u.capacity }}</p>
                <p><span>Notes</span>{{ u.notes || 'Ready for staff review' }}</p>
                <span class="status-chip" [ngClass]="statusClass(u)">{{ statusLabel(u) }}</span>
              </article>
            </div>
          </section>

          <aside class="sage-panel unit-copy-panel">
            <p class="eyebrow">Staff note</p>
            <h2>Confirm before placement.</h2>
            <p>Availability reflects the current dev room plan or live backend inventory when available. Confirm details with staff before placement if numbers look stale.</p>

            <div class="unit-copy-block">
              <h3>Pricing baseline</h3>
              <p>$750 per shared bed is the lowest all-inclusive baseline rate. Private rooms cost more depending on attached or private bathroom access; final private-room pricing still needs confirmation.</p>
            </div>

            <div class="unit-copy-block">
              <h3>Included amenities</h3>
              <p>Onsite laundry, power, water, wifi, common-area TV and furniture, and beds are included.</p>
            </div>
          </aside>
        </div>
      </main>
    </div>
  `,
})
export class UnitsListComponent implements OnInit {
  units: Unit[] = [];
  loading = false;
  error = '';
  inventoryNote = '';
  private readonly configuredUnits: Unit[] = [
    {
      id: 'elevin-unit-1',
      name: 'Unit 1 - 3 bed / 2 bath',
      capacity: 5,
      available: 5,
      status: 'available',
      notes: 'One private room with attached full bathroom; two regular rooms. Default shared occupancy is 2 people per regular room.',
    },
    {
      id: 'elevin-unit-2',
      name: 'Unit 2 - 2 bed / 2 bath',
      capacity: 3,
      available: 3,
      status: 'available',
      notes: 'One private room with attached full bathroom; one regular room. Default shared occupancy is 2 people in the regular room.',
    },
    {
      id: 'elevin-unit-3',
      name: 'Unit 3 - 2 bed / 1 bath',
      capacity: 4,
      available: 4,
      status: 'available',
      notes: 'Shared bathroom home with two rooms at the default 2 people per room. Devin note about one room/full bathroom needs confirmation.',
    },
  ];

  constructor(private api: ApiService) {}

  ngOnInit(): void { this.loadUnits(); }

  get totalCapacity(): number { return this.units.reduce((sum, u) => sum + (Number(u.capacity) || 0), 0); }
  get totalAvailable(): number { return this.units.reduce((sum, u) => sum + (Number(u.available) || 0), 0); }

  statusLabel(unit: Unit): string {
    if (!Number.isFinite(Number(unit.available)) || !Number.isFinite(Number(unit.capacity))) return 'Review';
    return Number(unit.available) > 0 ? 'Available' : 'Full';
  }

  statusClass(unit: Unit): string {
    const label = this.statusLabel(unit);
    if (label === 'Available') return 'active';
    if (label === 'Full') return 'restricted';
    return 'warning';
  }

  loadUnits(): void {
    this.loading = true;
    this.error = '';
    this.inventoryNote = '';
    this.api.getUnits().subscribe({
      next: (data) => {
        this.units = data.length > 0 ? data : this.configuredUnits;
        this.inventoryNote = data.length > 0
          ? 'Live backend inventory loaded.'
          : 'Configured room plan shown until live inventory sync is applied.';
        this.loading = false;
      },
      error: () => {
        this.units = this.configuredUnits;
        this.inventoryNote = 'Configured room plan shown because live inventory could not be reached.';
        this.loading = false;
      }
    });
  }
}
