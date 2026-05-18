import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminGuard: CanActivateFn = (_route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isLoggedIn()) {
    router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
    return false;
  }

  if (authService.needsPasswordChange() && !state.url.startsWith('/auth/reset-password')) {
    router.navigate(['/auth/reset-password']);
    return false;
  }

  const currentUser = authService.getCurrentUserSync();
  if (currentUser?.role === 'admin') {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};
