import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService, Unit } from '../../core/services/api.service';

@Component({
  selector: 'app-units-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <h1>Units</h1>
      <div class="card">
        <div *ngIf="loading" class="placeholder">Loading units...</div>
        <div *ngIf="error" class="alert">{{ error }}</div>
        <table *ngIf="!loading && !error" class="table">
          <thead>
            <tr>
              <th>Unit</th>
              <th>Capacity</th>
              <th>Available</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let u of units">
              <td>{{ u.name }}</td>
              <td>{{ u.capacity }}</td>
              <td>{{ u.available }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 1200px; margin: 2rem auto; padding: 0 1rem; }
    .card { background: #fff; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: .75rem; border-bottom: 1px solid #eee; text-align: left; }
    .placeholder { color: #999; }
    .alert { padding: 1rem; background: #fee; color: #900; border: 1px solid #fcc; border-radius: 6px; }
  `]
})
export class UnitsListComponent implements OnInit {
  units: Unit[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getUnits().subscribe({
      next: (data) => { this.units = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Failed to load units'; this.loading = false; }
    });
  }
}
