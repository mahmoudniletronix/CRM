import { Injectable, inject } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Auth } from '../../../Services/auth/auth';

@Injectable({ providedIn: 'root' })
export class AuthGuard implements CanActivate {
  private readonly auth = inject(Auth);
  private readonly router = inject(Router);

  canActivate(): boolean {
    if (this.auth.isAuthenticated()) return true;

    this.router.navigateByUrl('/login');
    return false;
  }
}
