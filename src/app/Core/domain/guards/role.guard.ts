import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { Auth } from '../../../Services/auth/auth';

@Injectable({ providedIn: 'root' })
export class RoleGuard implements CanActivate {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['/login']);
      return false;
    }

    const user = this.auth.currentUser();
    const requiredRoles = route.data['roles'] as Array<string>;

    //    Check if route requires specific roles
    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    // Check User Role
    if (user && requiredRoles.includes(user.role)) {
      return true;
    }

    // Forbidden - Redirect to login
    this.router.navigate(['/login']);
    return false;
  }
}
