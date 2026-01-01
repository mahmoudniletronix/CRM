import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from '../../../Services/auth/auth';
import { UserRole } from '../models/auth.models/auth.models';
import { defaultRouteForRole } from './role-routes';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  if (!auth.isAuthenticated()) {
    return router.createUrlTree(['/login']);
  }

  const user = auth.currentUser();
  const requiredRoles = (route.data['roles'] as UserRole[] | undefined) ?? [];

  // Allow access if no roles are required
  if (requiredRoles.length === 0) return true;

  // SuperAdmin has unrestricted access to all routes
  if (user?.role === 'SuperAdmin') return true;

  // Check if user's role is in the required roles list
  if (user && requiredRoles.includes(user.role)) return true;

  // Redirect to default route for user's role if access is denied
  const target = defaultRouteForRole(user?.role ?? null);

  return router.createUrlTree([target]);
};
