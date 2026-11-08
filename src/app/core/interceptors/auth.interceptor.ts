
import { inject } from '@angular/core';

import {
  HttpErrorResponse,
  HttpInterceptorFn
} from '@angular/common/http';

import { catchError, switchMap, throwError } from 'rxjs';

import { developmentEnvironment } from '../../../environments/environment.development';

import { AuthState } from '../../features/auth/services/auth-state';
import { AuthRefreshCoordinator } from '../../features/auth/services/auth-refresh-coordinator';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const authState = inject(AuthState);
  const refreshCoordinator = inject(AuthRefreshCoordinator);

  const apiBase = developmentEnvironment.apiUrl.replace(/\/$/, '');
  const apiPrefix = `${apiBase}/api/`;

  // Never attach the JWT to unrelated external services.
  if (!req.url.startsWith(apiPrefix)) {
    return next(req);
  }

  const authPrefix = `${apiPrefix}auth/`;
  const requestPath = req.url.split('?')[0];

  // Most auth endpoints use cookies or are public.
  // /api/auth/me is an exception because it requires a JWT.
  if (
    req.url.startsWith(authPrefix) &&
    requestPath !== `${authPrefix}me`
  ) {
    return next(req);
  }

  // Respect requests that explicitly provide authorization.
  if (req.headers.has('Authorization')) {
    return next(req);
  }

  const token = authState.accessToken();

  // No access token available.
  if (!token) {
    return next(req);
  }

  const withBearer = (accessToken: string) =>
    req.clone({
      setHeaders: {
        Authorization: `Bearer ${accessToken}`
      }
    });

  // Send the original request with the current JWT.
  return next(withBearer(token)).pipe(

    catchError(error => {

      // Only retry when the backend returns 401.
      if (
        !(error instanceof HttpErrorResponse) ||
        error.status !== 401
      ) {
        return throwError(() => error);
      }

      const latestToken = authState.accessToken();

      // Session was cleared, for example during logout.
      if (!latestToken) {
        return throwError(() => error);
      }

      // Another request may have refreshed the token already.
      if (latestToken !== token) {
        return next(withBearer(latestToken));
      }

      // Refresh once, then retry the original request.
      return refreshCoordinator.refreshOnce().pipe(
        switchMap(response =>
          next(withBearer(response.accessToken))
        )
      );
    })
  );
};
