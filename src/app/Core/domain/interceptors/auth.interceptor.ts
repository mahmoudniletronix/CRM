import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Auth } from '../../../Services/auth/auth';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);
  const token = authService.getToken();

  if (req.url.includes('/api/Auth/Login')) {
    return next(req);
  }

  if (token) {
    console.log('Attaching Token to request:', req.url);

    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      },
    });
  } else {
    console.warn('No token found for request:', req.url);
  }

  return next(req);
};
