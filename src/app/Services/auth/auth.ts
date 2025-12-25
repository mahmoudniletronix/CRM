import { Injectable, computed, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import {
  AuthUser,
  LoginRequest,
  LoginResponse,
} from '../../Core/domain/models/auth.models/auth.models';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly _user = signal<AuthUser | null>(this.readUserFromStorage());
  readonly currentUser = this._user.asReadonly();

  getRole(): string | undefined {
    return this._user()?.role;
  }

  readonly isAuthenticated = computed(() => !!this._user());
  readonly token = computed(() => this._user()?.token ?? null);
  readonly siteId = computed(() => this._user()?.siteId ?? null);

  /**
   * Login
   */
  login(payload: LoginRequest): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/api/Auth/Login`, payload).pipe(
      tap((response) => {
        // Decode JWT to get user info
        const userInfo = this.decodeJWT(response.token);

        const user: AuthUser = {
          id: userInfo.userId || '',
          fullName: userInfo.email || payload.email,
          email: userInfo.email || payload.email,
          role: response.roleName,
          token: response.token,
          permissions: response.permissions,
          siteId: response.siteId || userInfo.siteId || null,
        };

        this._user.set(user);
        localStorage.setItem('nt_crm_user', JSON.stringify(user));
      }),
      catchError((error) => {
        console.error('Login failed:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout
   */
  logout(): void {
    this._user.set(null);
    localStorage.removeItem('nt_crm_user');
    this.router.navigate(['/login']);
  }

  /**
   * Get current token
   */
  getToken(): string | null {
    return this.token();
  }

  /**
   * Decode JWT token
   */
  private decodeJWT(token: string): any {
    try {
      const base64Url = token.split('.')[1];
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      );
      return JSON.parse(jsonPayload);
    } catch (error) {
      console.error('Failed to decode JWT:', error);
      return {};
    }
  }

  /**
   * Read user from localStorage
   */
  private readUserFromStorage(): AuthUser | null {
    try {
      const raw = localStorage.getItem('nt_crm_user');
      return raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      return null;
    }
  }
}
