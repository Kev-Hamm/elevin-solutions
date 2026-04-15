import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './features/auth/login/login.component';
import { OTPVerifyComponent } from './features/auth/otp-verify/otp-verify.component';
import { TOTPSetupComponent } from './features/auth/totp-setup/totp-setup.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ClientListComponent } from './features/clients/client-list/client-list.component';
import { ClientFormComponent } from './features/clients/client-form/client-form.component';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'dashboard',
    pathMatch: 'full',
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'auth',
    children: [
      {
        path: 'otp-verify',
        component: OTPVerifyComponent,
      },
      {
        path: 'totp-setup',
        component: TOTPSetupComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
  },
  {
    path: 'clients',
    children: [
      {
        path: '',
        component: ClientListComponent,
        canActivate: [authGuard],
      },
      {
        path: 'new',
        component: ClientFormComponent,
        canActivate: [authGuard],
      },
      {
        path: ':id',
        component: ClientFormComponent,
        canActivate: [authGuard],
      },
    ],
  },
  {
    path: '**',
    redirectTo: 'dashboard',
  },
];
