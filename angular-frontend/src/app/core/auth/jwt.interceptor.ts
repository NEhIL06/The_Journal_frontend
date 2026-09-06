import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const jwtInterceptor: HttpInterceptorFn = (request, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.getToken();
  const isApiRequest = request.url.startsWith(environment.apiBaseUrl);
  const isPublicRequest = request.url.includes('/public/');

  const authenticatedRequest = token && isApiRequest && !isPublicRequest
    ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : request;

  return next(authenticatedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && !isPublicRequest) {
        auth.logout();
        void router.navigate(['/login'], { queryParams: { sessionExpired: true } });
      }
      return throwError(() => error);
    }),
  );
};
