import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { Auth } from './auth';
export const authGuard: CanActivateFn = (): boolean | UrlTree => {
  const auth = inject(Auth);
  const router = inject(Router);

  return auth.isAuthenticated() ? true : router.createUrlTree(['/login']);
};
