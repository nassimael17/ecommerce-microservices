import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roles = (route.data['roles'] ?? []) as Role[];

  if (!auth.isLoggedIn()) {
    router.navigateByUrl('/login');
    return false;
  }
  if (!roles.length || auth.hasRole(roles)) return true;

  router.navigateByUrl('/app/dashboard');
  return false;
};
