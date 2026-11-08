
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';

import { Auth } from '../../features/auth/services/auth';
import { AuthState } from '../../features/auth/services/auth-state';

@Component({
  selector: 'app-dashboard',
  imports: [],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly currentUser = this.authState.currentUser;

  readonly loggingOut = signal(false);
  readonly logoutError = signal<string | null>(null);

  async logout(): Promise<void> {
    if (this.loggingOut()) return;

    this.loggingOut.set(true);
    this.logoutError.set(null);

    try {
      await firstValueFrom(this.auth.logout());

      this.authState.clearSession();

      await this.router.navigateByUrl('/login', {
        replaceUrl: true
      });
    } catch (error) {
      if (
        error instanceof HttpErrorResponse &&
        error.status === 401
      ) {
        this.authState.clearSession();

        await this.router.navigateByUrl('/login', {
          replaceUrl: true
        });

        return;
      }

      this.logoutError.set(
        'Unable to log out. Please try again.'
      );

      console.error('Logout failed:', error);
    } finally {
      this.loggingOut.set(false);
    }
  }
}
