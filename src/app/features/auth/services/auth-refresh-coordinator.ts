
import { inject, Service } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';

import {
  Observable,
  catchError,
  finalize,
  shareReplay,
  tap,
  throwError
} from 'rxjs';

import { Auth } from './auth';
import { AuthState } from './auth-state';
import { LoginResponse } from '../models/login-response';

@Service()
export class AuthRefreshCoordinator {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);

  private ongoingRefresh$: Observable<LoginResponse> | null = null;

  refreshOnce(): Observable<LoginResponse> {

    // Reuse the refresh request if one is already running.
    if (this.ongoingRefresh$) {
      return this.ongoingRefresh$;
    }

    this.ongoingRefresh$ = this.auth.refresh().pipe(

      // Save the new access token and user information.
      tap(response => {
        this.authState.setSession(response);
      }),

      // Handle refresh-token rejection.
      catchError(error => {
        if (
          error instanceof HttpErrorResponse &&
          error.status === 401
        ) {
          this.authState.clearSession();
        }

        return throwError(() => error);
      }),

      // Release the shared request when it finishes.
      finalize(() => {
        this.ongoingRefresh$ = null;
      }),

      // Share the same HTTP result with concurrent subscribers.
      shareReplay({
        bufferSize: 1,
        refCount: false
      })
    );

    return this.ongoingRefresh$;
  }
}
