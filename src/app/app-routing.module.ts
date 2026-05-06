import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminGuard } from './core/guards/admin.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { OTPVerifyComponent } from './features/auth/otp-verify/otp-verify.component';
import { PasswordSetupComponent } from './features/auth/password-setup/password-setup.component';
import { TOTPSetupComponent } from './features/auth/totp-setup/totp-setup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';
import { UnitsListComponent } from './features/units/units-list.component';
import { CheckInComponent } from './features/occupancy/check-in.component';
import { SettingsComponent } from './features/settings/settings.component';
import { UserManagementComponent } from './features/users/user-management.component';
import { AdminIntakeListComponent } from './features/intake/admin-intake-list.component';
import { AdminIntakeDetailComponent } from './features/intake/admin-intake-detail.component';
import { IntakeFormComponent } from './features/intake/intake-form.component';
import { IntakeConfirmationComponent } from './features/intake/intake-confirmation.component';
import { PublicHomeComponent } from './features/public/public-home.component';

export const routes: Routes = [
  { path: '', component: PublicHomeComponent, pathMatch: 'full' },
  { path: 'about', component: PublicHomeComponent, data: { scrollTarget: 'about' } },
  { path: 'about-us', redirectTo: 'about', pathMatch: 'full' },
  { path: 'services', component: PublicHomeComponent, data: { scrollTarget: 'services' } },
  { path: 'intake', component: IntakeFormComponent },
  { path: 'intake/confirmation', component: IntakeConfirmationComponent },
  { path: 'login', component: LoginComponent },
  {
    path: 'auth',
    children: [
      { path: 'otp-verify', component: OTPVerifyComponent },
      { path: 'set-password', component: PasswordSetupComponent },
      { path: 'totp-setup', component: TOTPSetupComponent, canActivate: [authGuard] },
    ],
  },
  { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] },
  {
    path: 'clients',
    children: [
      { path: '', component: ClientListComponent, canActivate: [authGuard] },
      { path: 'new', component: ClientFormComponent, canActivate: [authGuard] },
      { path: ':id', component: ClientFormComponent, canActivate: [authGuard] },
    ],
  },
  { path: 'units', component: UnitsListComponent, canActivate: [authGuard] },
  { path: 'occupancies', component: CheckInComponent, canActivate: [authGuard] },
  {
    path: 'intake-submissions',
    children: [
      { path: '', component: AdminIntakeListComponent, canActivate: [authGuard] },
      { path: ':id', component: AdminIntakeDetailComponent, canActivate: [authGuard] },
    ],
  },
  { path: 'settings', component: SettingsComponent, canActivate: [authGuard] },
  { path: 'users', component: UserManagementComponent, canActivate: [adminGuard] },
  { path: '**', redirectTo: '', pathMatch: 'full' },
];
