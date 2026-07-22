import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { NotificationService } from '../services/notification.service';

/**
 * Global HTTP error handler: surfaces a friendly toast and re-throws so
 * components can still render their own error state.
 */
export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const notify = inject(NotificationService);

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      notify.error(deriveMessage(error));
      return throwError(() => error);
    }),
  );
};

function deriveMessage(error: HttpErrorResponse): string {
  if (error.status === 0) return 'Cannot reach the server. Is the API running?';
  if (error.status === 404) return 'The requested resource was not found.';
  if (error.status === 400) return 'The request was invalid.';
  if (error.status >= 500) return 'A server error occurred. Please try again later.';
  return error.error?.message || error.message || 'An unexpected error occurred.';
}
