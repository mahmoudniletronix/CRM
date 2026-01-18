import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../../Services/auth/auth';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();
  const role = authService.getRole();

  if (req.url.includes('/api/Auth/Login')) {
    return next(req);
  }

  if (token) {
    console.log(`[AuthInterceptor] Attaching Token. User Role: ${role}. Request: ${req.url}`);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.warn('[AuthInterceptor] No token found for request:', req.url);
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401) {
        console.warn('[AuthInterceptor] 401 Unauthorized detected. Logging out...');
        authService.logout();
      }
      return throwError(() => error);
    }),
  );
};
