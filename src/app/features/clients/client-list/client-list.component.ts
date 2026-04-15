import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService, Client } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Clients</h1>
        <a routerLink="/clients/new" class="btn">Add New Client</a>
      </div>

      <div class="card">
        <img src="/assets/elderly_co-living.png" alt="Warm co-living" class="hero-img" />
        <div *ngIf="loading" class="placeholder">Loading clients...</div>
        <div *ngIf="error" class="alert">{{ error }}</div>

        <table *ngIf="!loading && !error" class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let c of clients">
              <td>{{ c.firstName }} {{ c.lastName }}</td>
              <td>{{ c.email || '-' }}</td>
              <td>{{ c.phone || '-' }}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  `,
  styles: [`
    .container {
      max-width: 1200px;
      margin: 2rem auto;
      padding: 0 1rem;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }

    h1 { color: #333; }

    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 4px;
      text-decoration: none;
    }

    .card {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
    }
    .hero-img { width: 100%; height: 180px; object-fit: cover; border-radius: 8px; margin-bottom: 1rem; }

    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { padding: 0.75rem; border-bottom: 1px solid #eee; text-align: left; }

    .placeholder { color: #999; font-style: italic; }
    .alert { padding: 1rem; background: #fee; color: #900; border: 1px solid #fcc; border-radius: 6px; }
  `]
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  loading = false;
  error = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loading = true;
    this.api.getClients().subscribe({
      next: (data) => { this.clients = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Failed to load clients'; this.loading = false; }
    });
  }
}
