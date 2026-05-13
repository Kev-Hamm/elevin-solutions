import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { ApiService, Client } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-route-shell clients-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Resident support</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Resident support</p>
            <h1>Clients</h1>
            <p>Manage resident profiles for housing coordination. Keep information limited to what staff need for placement and follow-up.</p>
            <p class="privacy-note">Resident profiles for housing coordination — not medical records.</p>
          </div>
          <div class="hero-actions">
            <a routerLink="/clients/new" class="pill-button primary">Add client</a>
            <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
          </div>
        </section>

        <section class="surface-card clients-directory-card">
          <div class="section-header">
            <div>
              <p class="eyebrow">Directory</p>
              <h2>Client directory</h2>
              <p *ngIf="!loading && !error">{{ clients.length }} profile{{ clients.length === 1 ? '' : 's' }} loaded.</p>
            </div>
            <label class="search-control">
              <span>Search clients</span>
              <input type="search" [(ngModel)]="searchTerm" placeholder="Name, email, or phone" />
            </label>
          </div>

          <div *ngIf="loading" class="loading-state" aria-live="polite">Loading client directory...</div>
          <div *ngIf="error" class="error-banner" role="alert">{{ error }}</div>

          <ng-container *ngIf="!loading && !error">
            <div *ngIf="clients.length === 0" class="empty-state">
              <h3>No clients added yet.</h3>
              <p>Create the first client profile when staff are ready to begin housing coordination.</p>
              <a routerLink="/clients/new" class="pill-button primary">Add client</a>
            </div>

            <div *ngIf="clients.length > 0 && filteredClients.length === 0" class="empty-state">
              No clients match that search.
            </div>

            <div *ngIf="filteredClients.length > 0" class="data-table-wrap">
              <table class="admin-table client-table">
                <thead>
                  <tr><th>Name</th><th>Contact</th><th>Phone</th><th>Profile status</th></tr>
                </thead>
                <tbody>
                  <tr *ngFor="let c of filteredClients">
                    <td><strong>{{ c.firstName }} {{ c.lastName }}</strong></td>
                    <td>{{ c.email || 'No email on file' }}</td>
                    <td>{{ c.phone || 'No phone on file' }}</td>
                    <td><span class="status-chip neutral">Profile</span></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mobile-record-list" *ngIf="filteredClients.length > 0">
              <article class="record-card client-record-card" *ngFor="let c of filteredClients">
                <h3>{{ c.firstName }} {{ c.lastName }}</h3>
                <p><span>Email</span>{{ c.email || 'No email on file' }}</p>
                <p><span>Phone</span>{{ c.phone || 'No phone on file' }}</p>
                <span class="status-chip neutral">Profile</span>
              </article>
            </div>
          </ng-container>
        </section>
      </main>
    </div>
  `,
})
export class ClientListComponent implements OnInit {
  clients: Client[] = [];
  loading = false;
  error = '';
  searchTerm = '';

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.loadClients();
  }

  get filteredClients(): Client[] {
    const term = this.searchTerm.trim().toLowerCase();
    if (!term) return this.clients;
    return this.clients.filter(c => `${c.firstName} ${c.lastName} ${c.email || ''} ${c.phone || ''}`.toLowerCase().includes(term));
  }

  loadClients(): void {
    this.loading = true;
    this.error = '';
    this.api.getClients().subscribe({
      next: (data) => { this.clients = data; this.loading = false; },
      error: (err) => { this.error = err.error?.message || 'Unable to load clients right now.'; this.loading = false; }
    });
  }
}
