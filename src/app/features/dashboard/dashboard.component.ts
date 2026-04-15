import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { AuthService, User } from '../../core/services/auth.service';
import { HealthIndicatorComponent } from '../health/health-indicator.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, HealthIndicatorComponent],
  template: `
    <div class="dashboard">
      <nav class="navbar">
        <div class="navbar-content">
          <div class="logo">
            <h2>Elevin Solutions</h2>
          </div>
          <div class="user-info">
            <app-health-indicator></app-health-indicator>
            <span *ngIf="currentUser">Welcome, {{ currentUser.firstName }}!</span>
            <button (click)="logout()" class="logout-btn">Logout</button>
          </div>
        </div>
      </nav>

      <div class="container">
        <h1>Dashboard</h1>

        <div class="welcome-section">
          <p>
            Welcome to Elevin Solutions. Use the menu below to manage clients, housing units,
            and placements. We provide residential housing support — not medical care — with a
            focus on warm, community co-living.
          </p>
        </div>

        <div class="quick-links">
          <div class="link-card">
            <h3>👥 Clients</h3>
            <p>Manage resident profiles and history</p>
            <a [routerLink]="['/clients']" class="btn">View Clients</a>
          </div>

          <div class="link-card">
            <h3>🏠 Units</h3>
            <p>Manage housing units and bed availability</p>
            <a routerLink="/units" class="btn">View Units</a>
          </div>

          <div class="link-card">
            <h3>📋 Check-Ins</h3>
            <p>Place residents into available units</p>
            <a routerLink="/occupancies" class="btn">Start Check-In</a>
          </div>

          <div class="link-card">
            <h3>⚙️ Settings</h3>
            <p>Manage account and security settings</p>
            <a routerLink="/settings/security" class="btn">Go to Settings</a>
          </div>
        </div>

        <div class="info-section">
          <h2>Getting Started</h2>
          <ul>
            <li>Create residents in the system</li>
            <li>Add housing units to track capacity</li>
            <li>Use check-in to assign residents to units</li>
            <li>Track placements and non-medical housing support</li>
          </ul>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dashboard { display: flex; flex-direction: column; min-height: 100vh; background: #f5f5f5; }
    .navbar { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: #fff; padding: 1rem 0; box-shadow: 0 2px 4px rgba(0,0,0,.1); }
    .navbar-content { max-width: 1200px; margin: 0 auto; padding: 0 1rem; display: flex; justify-content: space-between; align-items: center; }
    .logo h2 { margin: 0; font-size: 1.5rem; }
    .user-info { display: flex; gap: 1rem; align-items: center; }
    .logout-btn { background: rgba(255,255,255,.2); color: #fff; border: 1px solid #fff; padding: .5rem 1rem; border-radius: 4px; cursor: pointer; }
    .container { flex: 1; max-width: 1200px; width: 100%; margin: 0 auto; padding: 2rem 1rem; }
    h1 { color: #333; margin-bottom: 1rem; }
    .welcome-section { background: #fff; padding: 1.5rem; border-radius: 8px; margin-bottom: 2rem; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
    .quick-links { display: grid; grid-template-columns: repeat(auto-fit,minmax(280px,1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .link-card { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,.1); transition: transform .2s, box-shadow .2s; }
    .link-card:hover { transform: translateY(-4px); box-shadow: 0 4px 12px rgba(0,0,0,.15); }
    .link-card h3 { color: #667eea; margin-bottom: .5rem; }
    .link-card p { color: #666; font-size: .9rem; margin-bottom: 1rem; }
    .btn { display: inline-block; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color: #fff; padding: .75rem 1.5rem; border-radius: 4px; text-decoration: none; }
    .info-section { background: #fff; padding: 1.5rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
    .info-section h2 { color: #333; margin-bottom: 1rem; }
    .info-section ul { list-style: none; padding: 0; }
    .info-section li { padding: .5rem 0 .5rem 1.5rem; position: relative; color: #666; }
    .info-section li:before { content: '✓'; position: absolute; left: 0; color: #667eea; font-weight: bold; }
  `]
})
export class DashboardComponent implements OnInit {
  currentUser: User | null = null;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();

    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: (response) => { this.currentUser = response.user; },
        error: () => { this.router.navigate(['/login']); },
      });
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
