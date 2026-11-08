
import {
  computed,
  inject,
  Service,
  signal
} from '@angular/core';

import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import { Auth } from './auth';
import { LoginResponse } from '../models/login-response';

type AuthStatus =
  | 'initializing'
  | 'authenticated'
  | 'unauthenticated'
  | 'unavailable';

@Service()
export class AuthState {
  private readonly auth = inject(Auth);

  private readonly session =
    signal<LoginResponse | null>(null);

  private readonly _status =
    signal<AuthStatus>('initializing');

  readonly status = this._status.asReadonly();

  readonly isAuthenticated = computed(
    () => this.session() !== null
  );

  readonly accessToken = computed(
    () => this.session()?.accessToken ?? null
  );

  readonly currentUser = computed(() => {
    const session = this.session();

    if (!session) return null;

    return {
      userId: session.userId,
      email: session.email,
      displayName: session.displayName,
      roles: session.roles
    };
  });

  // Called after successful Login or Refresh
  setSession(response: LoginResponse): void {
    this.session.set(response);
    this._status.set('authenticated');
  }

  // Called after Logout
  clearSession(): void {
    this.session.set(null);
    this._status.set('unauthenticated');
  }

  // Called when Angular starts
  async restoreSession(): Promise<void> {
    try {
      const response = await firstValueFrom(
        this.auth.refresh()
      );

      this.setSession(response);

    } catch (error) {
      this.session.set(null);

      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        this._status.set('unauthenticated');
      } else {
        this._status.set('unavailable');

        console.error(
          'Session restoration failed:',
          error
        );
      }
    }
  }
}
