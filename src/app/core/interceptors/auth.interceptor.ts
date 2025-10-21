import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth.service';
import { catchError, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);
  const token = authService.getToken();

  const isAuthEndpoint = req.url.includes('/login') || req.url.includes('/register');
  const shouldAttachToken = token && !isAuthEndpoint;
  const expectsAuthenticatedSession = !isAuthEndpoint;
  const requestToSend = shouldAttachToken
    ? req.clone({
        setHeaders: {
          Authorization: `Token ${token}`
        }
      })
    : req;

  return next(requestToSend).pipe(
    catchError((error: HttpErrorResponse) => {
      const serverMessage = ((): string => {
        if (!error.error) {
          return '';
        }

        if (typeof error.error === 'string') {
          return error.error;
        }

        return (
          error.error?.detail ||
          error.error?.message ||
          error.error?.error ||
          ''
        ) as string;
      })();

      const lowerMessage = `${serverMessage} ${error.message || ''}`
        .toString()
        .toLowerCase();

      const messageHintsInvalidToken =
        lowerMessage.includes('invalid token') ||
        lowerMessage.includes('token has expired') ||
        lowerMessage.includes('token is expired');
      const mentionsTokenOrCredentials =
        lowerMessage.includes('token') || lowerMessage.includes('credentials') || lowerMessage.includes('authorization');

      const shouldForceLogout =
        expectsAuthenticatedSession && (
          error.status === 401 ||
          (error.status === 403 && mentionsTokenOrCredentials) ||
          messageHintsInvalidToken
        );

      if (shouldForceLogout) {
        const rawMessage = serverMessage || error.message || '';
        const displayMessage = rawMessage.toString().trim() || 'Your session is no longer valid. Please sign in again.';
        authService.handleInvalidToken(displayMessage);
      }

      return throwError(() => error);
    })
  );
};