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
    <div class="users-page">
      <div class="page-header">
        <div>
          <a routerLink="/dashboard" class="back-link">← Back to dashboard</a>
          <h1>User List</h1>
          <p>Invite staff members and track whether they still need to finish account setup.</p>
        </div>
      </div>

      <div *ngIf="loadError" class="banner error">{{ loadError }}</div>
      <div *ngIf="successMessage" class="banner success">{{ successMessage }}</div>
      <div *ngIf="actionError" class="banner error">{{ actionError }}</div>

      <div *ngIf="!isAdmin" class="card denied">
        <h2>Admin access required</h2>
        <p>Only admins can invite staff users.</p>
      </div>

      <ng-container *ngIf="isAdmin">
        <div class="layout">
          <section class="card invite-card">
            <h2>Invite user</h2>
            <p class="helper">A temporary password will be generated and emailed automatically.</p>

            <form (ngSubmit)="submitInvite()" #inviteForm="ngForm">
              <div class="grid">
                <label>
                  <span>First name</span>
                  <input [(ngModel)]="form.firstName" name="firstName" required [disabled]="submitting" />
                </label>

                <label>
                  <span>Last name</span>
                  <input [(ngModel)]="form.lastName" name="lastName" required [disabled]="submitting" />
                </label>

                <label class="full-width">
                  <span>Email</span>
                  <input [(ngModel)]="form.email" name="email" type="email" autocomplete="email" required [disabled]="submitting" />
                </label>

                <label class="full-width">
                  <span>Role</span>
                  <select [(ngModel)]="form.role" name="role" required [disabled]="submitting">
                    <option value="">Select a role</option>
                    <option *ngFor="let role of roles" [value]="role">{{ roleLabels[role] }}</option>
                  </select>
                </label>
              </div>

              <div *ngIf="formError" class="inline-error">{{ formError }}</div>

              <button type="submit" class="primary-btn" [disabled]="submitting || inviteForm.invalid">
                {{ submitting ? 'Sending invitation...' : 'Send invitation' }}
              </button>
            </form>
          </section>

          <section class="card list-card">
            <div class="list-header">
              <h2>Staff users</h2>
              <button type="button" class="secondary-btn" (click)="loadUsers()" [disabled]="loadingUsers">
                {{ loadingUsers ? 'Refreshing...' : 'Refresh' }}
              </button>
            </div>

            <div *ngIf="loadingUsers" class="empty-state">Loading users...</div>

            <div *ngIf="!loadingUsers && users.length === 0" class="empty-state">
              No staff users found yet.
            </div>

            <div *ngIf="!loadingUsers && users.length > 0" class="user-table">
              <div class="user-row header">
                <span>Name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Status</span>
                <span>Actions</span>
              </div>

              <div *ngFor="let user of users" class="user-row">
                <span>{{ user.firstName }} {{ user.lastName }}</span>
                <span>{{ user.email }}</span>
                <span>{{ roleLabels[user.role] || user.role }}</span>
                <span>
                  <span class="status-chip" [class.pending]="isPendingSetup(user)">
                    {{ isPendingSetup(user) ? 'Pending setup' : 'Active' }}
                  </span>
                </span>
                <span class="actions-cell">
                  <button
                    type="button"
                    class="secondary-btn action-btn"
                    (click)="resetPassword(user)"
                    [disabled]="resettingUserId === user.id"
                  >
                    {{ resettingUserId === user.id ? 'Sending reset...' : 'Reset password' }}
                  </button>
                </span>
              </div>
            </div>
          </section>
        </div>
      </ng-container>
    </div>
  `,
  styles: [`
    .users-page { max-width: 1200px; margin: 0 auto; padding: 2rem 1rem 3rem; }
    .page-header { margin-bottom: 1.5rem; }
    .back-link { color: #667eea; text-decoration: none; font-weight: 600; }
    h1 { margin: .5rem 0; color: #1f2937; }
    .layout { display: grid; grid-template-columns: minmax(320px, 420px) 1fr; gap: 1.5rem; align-items: start; }
    .card { background: #fff; border-radius: 12px; box-shadow: 0 8px 24px rgba(15, 23, 42, .08); padding: 1.5rem; }
    .helper { color: #4b5563; margin-top: 0; }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    label { display: flex; flex-direction: column; gap: .4rem; color: #374151; font-weight: 600; }
    .full-width { grid-column: 1 / -1; }
    input, select { border: 1px solid #d1d5db; border-radius: 8px; padding: .8rem .9rem; font: inherit; }
    input:focus, select:focus { outline: none; border-color: #667eea; box-shadow: 0 0 0 3px rgba(102, 126, 234, .12); }
    .primary-btn, .secondary-btn { border: 0; border-radius: 8px; cursor: pointer; font-weight: 700; padding: .85rem 1.1rem; }
    .primary-btn { margin-top: 1rem; width: 100%; color: #fff; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
    .secondary-btn { background: #eef2ff; color: #4338ca; }
    .primary-btn:disabled, .secondary-btn:disabled { opacity: .65; cursor: not-allowed; }
    .banner { border-radius: 10px; padding: .9rem 1rem; margin-bottom: 1rem; }
    .banner.success { background: #ecfdf5; color: #166534; border: 1px solid #bbf7d0; }
    .banner.error, .inline-error { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
    .inline-error { border-radius: 8px; padding: .75rem .9rem; margin-top: 1rem; }
    .list-header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem; }
    .user-table { display: grid; gap: .75rem; }
    .user-row { display: grid; grid-template-columns: 1.2fr 1.5fr 1fr 140px 150px; gap: 1rem; align-items: center; padding: .9rem 1rem; border: 1px solid #e5e7eb; border-radius: 10px; }
    .user-row.header { background: #f8fafc; color: #475569; font-size: .9rem; font-weight: 700; }
    .status-chip { display: inline-flex; align-items: center; justify-content: center; min-width: 96px; padding: .35rem .7rem; border-radius: 999px; background: #dbeafe; color: #1d4ed8; font-size: .85rem; font-weight: 700; }
    .status-chip.pending { background: #fef3c7; color: #92400e; }
    .empty-state { padding: 1.5rem 1rem; color: #6b7280; text-align: center; border: 1px dashed #d1d5db; border-radius: 10px; }
    .actions-cell { display: flex; justify-content: flex-start; }
    .action-btn { width: 100%; }
    .denied { max-width: 520px; }
    @media (max-width: 960px) {
      .layout { grid-template-columns: 1fr; }
    }
    @media (max-width: 720px) {
      .grid, .user-row { grid-template-columns: 1fr; }
      .user-row.header { display: none; }
    }
  `],
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
  roles = ['admin', 'caseworker', 'operations', 'receptionist'];
  roleLabels: Record<string, string> = {
    admin: 'Admin',
    caseworker: 'Caseworker',
    operations: 'Operations',
    receptionist: 'Receptionist',
  };
  form = {
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  };

  constructor(
    private adminUsersService: AdminUsersService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.currentUser = this.authService.getCurrentUserSync();
    this.isAdmin = this.currentUser?.role === 'admin';

    if (!this.currentUser) {
      this.authService.getCurrentUser().subscribe({
        next: ({ user }) => {
          this.currentUser = user;
          this.isAdmin = user.role === 'admin';
          if (this.isAdmin) {
            this.loadUsers();
          }
        },
        error: () => this.router.navigate(['/login']),
      });
      return;
    }

    if (this.isAdmin) {
      this.loadUsers();
    }
  }

  loadUsers(): void {
    if (!this.isAdmin) {
      return;
    }

    this.loadingUsers = true;
    this.loadError = '';

    this.adminUsersService.listUsers().subscribe({
      next: ({ users }) => {
        this.users = users.map(user => this.normalizeUserRecord(user));
        this.loadingUsers = false;
      },
      error: (err) => {
        this.loadingUsers = false;
        this.loadError = err.error?.message || 'Unable to load users right now.';
      },
    });
  }

  submitInvite(): void {
    if (this.submitting || !this.isAdmin) {
      return;
    }

    this.submitting = true;
    this.formError = '';
    this.actionError = '';
    this.successMessage = '';

    this.adminUsersService.createUser({
      firstName: this.form.firstName.trim(),
      lastName: this.form.lastName.trim(),
      email: this.form.email.trim(),
      role: this.form.role,
    }).subscribe({
      next: ({ message, user }) => {
        this.submitting = false;
        this.successMessage = message;
        this.form = { firstName: '', lastName: '', email: '', role: '' };
        const normalizedUser = this.normalizeUserRecord(user);
        this.users = [normalizedUser, ...this.users.filter(existing => existing.id !== user.id)];
      },
      error: (err) => {
        this.submitting = false;
        this.formError = err.error?.message || 'Unable to send invitation right now.';
      },
    });
  }

  resetPassword(user: AdminUserRecord): void {
    if (!this.isAdmin || this.resettingUserId) {
      return;
    }

    const confirmed = window.confirm(
      `Reset password?\n\nThis will generate a temporary password, email it to ${user.email}, and require the user to choose a new password at next sign-in. The temporary password will not be shown here.`
    );

    if (!confirmed) {
      return;
    }

    this.resettingUserId = user.id;
    this.actionError = '';
    this.formError = '';
    this.successMessage = '';

    this.adminUsersService.resetPassword(user.id).subscribe({
      next: ({ message }) => {
        this.resettingUserId = null;
        this.successMessage = message;
        this.users = this.users.map(existing => existing.id === user.id
          ? this.normalizeUserRecord({
              ...existing,
              forcePasswordChangeOnFirstLogin: true,
            })
          : existing);
      },
      error: (err) => {
        this.resettingUserId = null;
        this.actionError = err.error?.message || 'Unable to send reset email right now.';
      },
    });
  }

  isPendingSetup(user: AdminUserRecord): boolean {
    return user.forcePasswordChangeOnFirstLogin;
  }

  private normalizeUserRecord(user: AdminUserRecord): AdminUserRecord {
    const pendingSetup = user.forcePasswordChangeOnFirstLogin;

    return {
      ...user,
      status: pendingSetup ? 'pending' : 'active',
    };
  }
}
