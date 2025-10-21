import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const shouldAttachToken = token && !req.url.includes('/login') && !req.url.includes('/register');
  const requestToSend = shouldAttachToken
    ? req.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      })
    : req;

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      const lowerMessage = (error.error?.detail || error.error?.message || error.message || '')
        .toString()
        .toLowerCase();

      const messageHintsInvalidToken =
        lowerMessage.includes('invalid token') ||
        lowerMessage.includes('token has expired') ||
        lowerMessage.includes('token is expired');
      const mentionsTokenOrCredentials =
        lowerMessage.includes('token') || lowerMessage.includes('credentials') || lowerMessage.includes('authorization');

      const shouldForceLogout =
        !!token && (
          error.status === 401 ||
          (error.status === 403 && mentionsTokenOrCredentials) ||
          messageHintsInvalidToken
        );

      if (shouldForceLogout) {
        const rawMessage = (error.error?.detail || error.error?.message || error.message || '').toString();
        const displayMessage = rawMessage.trim() || 'Your session is no longer valid. Please sign in again.';
        authService.handleInvalidToken(displayMessage);
      }

      return throwError(() => error);
    })
  );
};