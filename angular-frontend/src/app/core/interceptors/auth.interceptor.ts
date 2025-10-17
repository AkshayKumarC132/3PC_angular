import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  // Clone the request and add the authorization header if token exists
  if (token && !req.url.includes('/login') && !req.url.includes('/register')) {
    const clonedReq = req.clone({
      setHeaders: {
        Authorization: `Token ${token}`
      }
    });
    return next(clonedReq);
  }

  return next(req);
};