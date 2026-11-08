
import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { AuthState } from '../../features/auth/services/auth-state';

export const authGuard: CanActivateFn = () => {
  const authState = inject(AuthState);
  const router = inject(Router);

  if (authState.status() === 'authenticated') {
    return true;
  }

  return router.createUrlTree(['/login']);
};
