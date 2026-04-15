import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  selector: 'app-client-form',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>New Client</h1>
        <a routerLink="/clients" class="btn secondary">Back to List</a>
      </div>

      <div class="card">
        <form (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="firstName">First Name</label>
            <input type="text" id="firstName" [(ngModel)]="form.firstName" name="firstName" required />
          </div>

          <div class="form-group">
            <label for="lastName">Last Name</label>
            <input type="text" id="lastName" [(ngModel)]="form.lastName" name="lastName" required />
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input type="email" id="email" [(ngModel)]="form.email" name="email" />
          </div>

          <div class="form-group">
            <label for="phone">Phone</label>
            <input type="tel" id="phone" [(ngModel)]="form.phone" name="phone" />
          </div>

          <div class="form-group">
            <label for="address">Address</label>
            <input type="text" id="address" [(ngModel)]="form.address" name="address" />
          </div>

          <div class="form-group">
            <label for="dob">Date of Birth</label>
            <input type="date" id="dob" [(ngModel)]="form.dateOfBirth" name="dateOfBirth" />
          </div>

          <div *ngIf="error" class="alert">{{ error }}</div>

          <div class="form-actions">
            <button type="submit" class="btn" [disabled]="loading">{{ loading ? 'Saving...' : 'Save Client' }}</button>
            <a routerLink="/clients" class="btn secondary">Cancel</a>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .container { max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    h1 { color: #333; }
    .card { background: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,.05); }
    .form-group { margin-bottom: 1.5rem; }
    label { display: block; font-weight: 500; color: #333; margin-bottom: .5rem; }
    input { width: 100%; padding: .75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem; }
    .form-actions { display: flex; gap: 1rem; margin-top: 2rem; }
    .btn { flex: 1; padding: .75rem; background: linear-gradient(135deg,#667eea 0%,#764ba2 100%); color: #fff; border: 0; border-radius: 4px; text-align: center; text-decoration: none; cursor: pointer; }
    .btn.secondary { background: #666; }
    .alert { padding: 1rem; background: #fee; color: #900; border: 1px solid #fcc; border-radius: 6px; }
  `]
})
export class ClientFormComponent implements OnInit {
  form: any = { firstName: '', lastName: '', email: '', phone: '', address: '', dateOfBirth: '' };
  loading = false;
  error = '';

  constructor(private api: ApiService, private router: Router) {}

  ngOnInit(): void {}

  onSubmit(): void {
    this.loading = true; this.error = '';
    this.api.createClient(this.form).subscribe({
      next: () => { this.loading = false; this.router.navigate(['/clients']); },
      error: (err) => { this.loading = false; this.error = err.error?.message || 'Failed to save client'; }
    });
  }
}
