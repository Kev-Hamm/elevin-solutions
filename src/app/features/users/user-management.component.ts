import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AdminUserRecord, AdminUsersService } from '../../core/services/admin-users.service';
import { AuthService, User } from '../../core/services/auth.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="admin-route-shell users-admin-page">
      <div class="admin-route-topbar">
        <a routerLink="/" class="brand-home-link" aria-label="Elevin Solutions public home">Elevin Solutions</a>
        <span>Admin-only</span>
        <a routerLink="/dashboard" class="pill-button secondary">Back to dashboard</a>
      </div>

      <main class="admin-route-body">
        <section class="route-hero-card">
          <div>
            <p class="eyebrow">Admin-only</p>
            <h1>Users</h1>
            <p>Invite staff and manage account setup without exposing temporary credentials.</p>
            <span class="status-chip restricted admin-only-chip">Admin guard required</span>
          </div>
        </section>

        <div *ngIf="loadError" class="error-banner" role="alert">{{ loadError }}</div>
        <div *ngIf="successMessage" class="success-banner" role="status">{{ successMessage }}</div>
        <div *ngIf="actionError" class="error-banner" role="alert">{{ actionError }}</div>

        <div *ngIf="!isAdmin" class="surface-card denied">
          <h2>Admin access required</h2>
          <p>Only admins can invite staff users.</p>
        </div>

        <ng-container *ngIf="isAdmin">
          <div class="route-layout users-layout">
            <section class="surface-card invite-user-card">
              <p class="eyebrow">Invite</p>
              <h2>Invite user</h2>
              <p>A secure setup link will be emailed automatically. Temporary credentials are not displayed here.</p>
              <form (ngSubmit)="submitInvite()" #inviteForm="ngForm">
                <div class="form-grid">
                  <div class="form-group"><label for="firstName">First name</label><input id="firstName" [(ngModel)]="form.firstName" name="firstName" required [disabled]="submitting" /></div>
                  <div class="form-group"><label for="lastName">Last name</label><input id="lastName" [(ngModel)]="form.lastName" name="lastName" required [disabled]="submitting" /></div>
                  <div class="form-group full-width"><label for="email">Email</label><input id="email" [(ngModel)]="form.email" name="email" type="email" autocomplete="email" required [disabled]="submitting" /></div>
                  <div class="form-group full-width"><label for="role">Role</label><select id="role" [(ngModel)]="form.role" name="role" required [disabled]="submitting"><option value="">Select a role</option><option *ngFor="let role of roles" [value]="role">{{ roleLabels[role] }}</option></select></div>
                </div>
                <div *ngIf="formError" class="error-banner" role="alert">{{ formError }}</div>
                <button type="submit" class="pill-button primary full-width-button" [disabled]="submitting || inviteForm.invalid">{{ submitting ? 'Sending invitation...' : 'Send invitation' }}</button>
              </form>
              <div class="sage-panel role-help-panel">
                <strong>Roles:</strong> Admin manages users; staff supports residents and intake follow-up; operations manages placement flow; receptionist supports intake coordination.
              </div>
            </section>

            <section class="surface-card staff-users-card">
              <div class="section-header">
                <div><p class="eyebrow">Staff</p><h2>Staff users</h2></div>
                <button type="button" class="pill-button secondary" (click)="loadUsers()" [disabled]="loadingUsers">{{ loadingUsers ? 'Refreshing...' : 'Refresh' }}</button>
              </div>

              <div *ngIf="loadingUsers" class="loading-state" aria-live="polite">Loading staff users...</div>
              <div *ngIf="!loadingUsers && users.length === 0" class="empty-state">No staff users found yet.</div>

              <div *ngIf="!loadingUsers && users.length > 0" class="data-table-wrap">
                <table class="admin-table">
                  <thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Setup status</th><th>Actions</th></tr></thead>
                  <tbody>
                    <tr *ngFor="let user of users">
                      <td><strong>{{ user.firstName }} {{ user.lastName }}</strong></td><td>{{ user.email }}</td><td>{{ roleLabels[user.role] || user.role }}</td>
                      <td><span class="status-chip setup-status-chip" [class.pending]="isPendingSetup(user)" [class.active]="!isPendingSetup(user)">{{ isPendingSetup(user) ? 'Pending setup' : 'Active' }}</span></td>
                      <td><button type="button" class="pill-button secondary small" (click)="requirePasswordReset(user)" [disabled]="resettingUserId === user.id">{{ resettingUserId === user.id ? 'Marking reset...' : 'Require reset' }}</button></td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div class="mobile-record-list" *ngIf="!loadingUsers && users.length > 0">
                <article class="record-card staff-user-card" *ngFor="let user of users">
                  <h3>{{ user.firstName }} {{ user.lastName }}</h3><p><span>Email</span>{{ user.email }}</p><p><span>Role</span>{{ roleLabels[user.role] || user.role }}</p>
                  <span class="status-chip setup-status-chip" [class.pending]="isPendingSetup(user)" [class.active]="!isPendingSetup(user)">{{ isPendingSetup(user) ? 'Pending setup' : 'Active' }}</span>
                  <button type="button" class="pill-button secondary" (click)="requirePasswordReset(user)" [disabled]="resettingUserId === user.id">{{ resettingUserId === user.id ? 'Marking reset...' : 'Require reset' }}</button>
                </article>
              </div>
            </section>
          </div>
        </ng-container>
      </main>
    </div>
  `,
})
export class UserManagementComponent implements OnInit {
  currentUser: User | null = null;
  isAdmin = false;
  loadingUsers = false;
  submitting = false;
  loadError = '';
  formError = '';
  successMessage = '';
  actionError = '';
  resettingUserId: string | null = null;
  users: AdminUserRecord[] = [];
  roles = ['admin', 'staff', 'operations', 'receptionist'];
  roleLabels: Record<string, string> = { admin: 'Admin', staff: 'Staff', caseworker: 'Staff', operations: 'Operations', receptionist: 'Receptionist' };
  form = { firstName: '', lastName: '', email: '', role: '' };

  constructor(private adminUsersService: AdminUsersService, private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();
    this.isAdmin = this.currentUser?.role === 'admin';
    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({ next: ({ user }) => { this.currentUser = user; this.isAdmin = user.role === 'admin'; if (this.isAdmin) this.loadUsers(); }, error: () => this.router.navigate(['/login']) });
      return;
    }
    if (this.isAdmin) this.loadUsers();
  }

  loadUsers(): void {
    if (!this.isAdmin) return;
    this.loadingUsers = true; this.loadError = '';
    this.adminUsersService.listUsers().subscribe({ next: ({ users }) => { this.users = users.map(user => this.normalizeUserRecord(user)); this.loadingUsers = false; }, error: (err) => { this.loadingUsers = false; this.loadError = err.error?.message || 'Unable to load users right now.'; } });
  }

  submitInvite(): void {
    if (this.submitting || !this.isAdmin) return;
    this.submitting = true; this.formError = ''; this.actionError = ''; this.successMessage = '';
    this.adminUsersService.createUser({ firstName: this.form.firstName.trim(), lastName: this.form.lastName.trim(), email: this.form.email.trim(), role: this.form.role }).subscribe({
      next: ({ message, user }) => { this.submitting = false; this.successMessage = message; this.form = { firstName: '', lastName: '', email: '', role: '' }; const normalizedUser = this.normalizeUserRecord(user); this.users = [normalizedUser, ...this.users.filter(existing => existing.id !== user.id)]; },
      error: (err) => { this.submitting = false; this.formError = err.error?.message || 'Unable to send invitation right now.'; },
    });
  }

  requirePasswordReset(user: AdminUserRecord): void {
    if (!this.isAdmin || this.resettingUserId) return;
    const confirmed = window.confirm(`Require password reset?\n\n${user.email} will keep their current password for sign-in, then must choose a new password before using the dashboard.`);
    if (!confirmed) return;
    this.resettingUserId = user.id; this.actionError = ''; this.formError = ''; this.successMessage = '';
    this.adminUsersService.requirePasswordReset(user.id).subscribe({
      next: ({ message }) => { this.resettingUserId = null; this.successMessage = message; this.users = this.users.map(existing => existing.id === user.id ? this.normalizeUserRecord({ ...existing, forcePasswordChangeOnFirstLogin: true }) : existing); },
      error: (err) => { this.resettingUserId = null; this.actionError = err.error?.message || 'Unable to require password reset right now.'; },
    });
  }

  isPendingSetup(user: AdminUserRecord): boolean { return user.forcePasswordChangeOnFirstLogin; }
  private normalizeUserRecord(user: AdminUserRecord): AdminUserRecord { const pendingSetup = user.forcePasswordChangeOnFirstLogin; return { ...user, status: pendingSetup ? 'pending' : 'active' }; }
}
