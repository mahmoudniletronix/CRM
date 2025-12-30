import { HttpInterceptorFn } from '@angular/common/http';

export const languageInterceptor: HttpInterceptorFn = (req, next) => {
  const lang = localStorage.getItem('lang') || 'en';

  const clonedRequest = req.clone({
    setHeaders: {
      'Accept-Language': lang,
      'x-lang': lang,
    },
  });

  return next(clonedRequest);
};
