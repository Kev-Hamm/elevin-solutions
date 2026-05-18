import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { HealthIndicatorComponent } from '../health/health-indicator.component';

interface DashboardNavItem {
  label: string;
  route: string;
  icon: string;
  adminOnly?: boolean;
}

interface DashboardActionCard extends DashboardNavItem {
  title: string;
  description: string;
  cta: string;
  chip: string;
  chipTone: 'active' | 'pending' | 'restricted';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HealthIndicatorComponent],
  template: `
    <div class="admin-shell">
      <header class="admin-topbar">
        <div class="topbar-inner">
          <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">
            <span class="brand-mark" aria-hidden="true">E</span>
            <span class="brand-copy">
              <span class="eyebrow">Staff operations</span>
              <span class="wordmark">Elevin Solutions</span>
            </span>
          </a>

          <div class="title-block">
            <p class="eyebrow">Protected workspace</p>
            <h1>Staff Dashboard</h1>
          </div>

          <div class="topbar-actions" aria-label="Account and system status">
            <app-health-indicator></app-health-indicator>
            <div class="account-chip" *ngIf="currentUser">
              <span class="account-name">{{ currentUser.firstName }}</span>
              <span class="role-chip">{{ displayRole(currentUser.role) }}</span>
            </div>
            <a routerLink="/settings" class="ghost-action">Settings</a>
            <button type="button" (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </header>

      <div class="admin-body">
        <nav class="staff-sidebar" aria-label="Staff navigation">
          <a
            *ngFor="let item of visibleNavItems"
            [routerLink]="item.route"
            routerLinkActive="active"
            [routerLinkActiveOptions]="{ exact: item.route === '/dashboard' }"
            [attr.aria-current]="isActiveRoute(item.route) ? 'page' : null"
          >
            <span aria-hidden="true">{{ item.icon }}</span>
            <span>{{ item.label }}</span>
          </a>
        </nav>

        <main class="dashboard-content">
          <section class="hero-panel" aria-labelledby="dashboard-title">
            <div>
              <p class="eyebrow">Staff dashboard</p>
              <h2 id="dashboard-title">Calm, secure housing operations at a glance.</h2>
              <p>
                Manage residents, housing units, intake submissions, and placements from one protected staff workspace. Elevin provides residential housing support, furnished rooms, and warm community co-living.
              </p>
            </div>
            <div class="hero-status" aria-live="polite">
              <span class="status-chip active">API status visible in header</span>
              <span class="status-chip restricted">Authenticated staff area</span>
            </div>
          </section>

          <section class="summary-strip" aria-label="Operations summary">
            <article class="metric-tile">
              <span class="metric-label">Intake queue</span>
              <strong>Review</strong>
              <span class="metric-note">Masked records only</span>
            </article>
            <article class="metric-tile">
              <span class="metric-label">Units</span>
              <strong>Track</strong>
              <span class="metric-note">Housing availability</span>
            </article>
            <article class="metric-tile">
              <span class="metric-label">Clients</span>
              <strong>Support</strong>
              <span class="metric-note">Resident profiles</span>
            </article>
            <article class="metric-tile" *ngIf="currentUser?.role === 'admin'">
              <span class="metric-label">Staff setup</span>
              <strong>Admin</strong>
              <span class="metric-note">Invites and accounts</span>
            </article>
          </section>

          <section class="action-grid" aria-labelledby="actions-title">
            <div class="section-heading">
              <p class="eyebrow">Primary actions</p>
              <h2 id="actions-title">Where staff go next</h2>
            </div>

            <article class="action-card" *ngFor="let card of visibleActionCards">
              <div class="card-heading">
                <span class="card-icon" aria-hidden="true">{{ card.icon }}</span>
                <div>
                  <h3>{{ card.title }}</h3>
                  <span class="status-chip" [ngClass]="card.chipTone">{{ card.chip }}</span>
                </div>
              </div>
              <p>{{ card.description }}</p>
              <a [routerLink]="card.route" class="primary-link">{{ card.cta }}</a>
            </article>
          </section>

          <section class="lower-grid">
            <article class="ops-panel" aria-labelledby="attention-title" aria-live="polite">
              <p class="eyebrow">Needs attention</p>
              <h2 id="attention-title">No urgent staff actions right now.</h2>
              <p>Use the intake queue and health status pill to check for pending reviews or API issues. No fake metrics are shown until backend counts are wired.</p>
            </article>

            <article class="ops-panel" aria-labelledby="guide-title">
              <p class="eyebrow">Staff guide</p>
              <h2 id="guide-title">Getting started</h2>
              <ul class="guide-list">
                <li>Create residents in the system.</li>
                <li>Add housing units to track capacity.</li>
                <li>Use check-ins to assign residents to available units.</li>
                <li>Track placements and non-medical housing support.</li>
              </ul>
            </article>
          </section>
        </main>
      </div>
    </div>
  `,
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  readonly navItems: DashboardNavItem[] = [
    { label: 'Dashboard', route: '/dashboard', icon: '▣' },
    { label: 'Clients', route: '/clients', icon: '◎' },
    { label: 'Units', route: '/units', icon: '⌂' },
    { label: 'Check-ins', route: '/occupancies', icon: '✓' },
    { label: 'Intake Queue', route: '/intake-submissions', icon: '◇' },
    { label: 'Users', route: '/users', icon: '◐', adminOnly: true },
    { label: 'Settings', route: '/settings', icon: '⚙' },
  ];

  readonly actionCards: DashboardActionCard[] = [
    { label: 'Clients', title: 'Clients', route: '/clients', icon: '◎', description: 'Manage resident profiles and history.', cta: 'View clients', chip: 'Active records', chipTone: 'active' },
    { label: 'Units', title: 'Units', route: '/units', icon: '⌂', description: 'Track housing units and bed availability.', cta: 'View units', chip: 'Capacity', chipTone: 'active' },
    { label: 'Check-ins', title: 'Check-ins', route: '/occupancies', icon: '✓', description: 'Assign residents to available units.', cta: 'Start check-in', chip: 'Placement flow', chipTone: 'pending' },
    { label: 'Intake submissions', title: 'Intake submissions', route: '/intake-submissions', icon: '◇', description: 'Review masked intake records and submission details.', cta: 'Open intake queue', chip: 'SSN masked', chipTone: 'restricted' },
    { label: 'Users', title: 'Users', route: '/users', icon: '◐', description: 'Invite staff and manage account setup.', cta: 'Manage users', chip: 'Admin only', chipTone: 'restricted', adminOnly: true },
    { label: 'Settings', title: 'Settings', route: '/settings', icon: '⚙', description: 'Security, password, and account settings.', cta: 'Go to settings', chip: 'Account', chipTone: 'pending' },
  ];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  get visibleNavItems(): DashboardNavItem[] {
    return this.navItems.filter((item) => !item.adminOnly || this.currentUser?.role === 'admin');
  }

  get visibleActionCards(): DashboardActionCard[] {
    return this.actionCards.filter((card) => !card.adminOnly || this.currentUser?.role === 'admin');
  }

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();

    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: (response) => { this.currentUser = response.user; },
        error: () => { this.router.navigate(['/login']); },
      });
    }
  }

  isActiveRoute(route: string): boolean {
    return this.router.url === route || (route !== '/dashboard' && this.router.url.startsWith(`${route}/`));
  }

  displayRole(role?: string): string {
    if (!role || role === 'caseworker') {
      return 'staff';
    }

    return role;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/']);
  }
}
