
import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

import {
  form,
  FormField,
  required,
  email,
  submit
} from '@angular/forms/signals';

import { Auth } from '../../features/auth/services/auth';
import { AuthState } from '../../features/auth/services/auth-state';
import { LoginRequest } from '../../features/auth/models/login-request';
import { LoginResponse } from '../../features/auth/models/login-response';

@Component({
  selector: 'app-login',
  imports: [FormField, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private readonly auth = inject(Auth);
  private readonly authState = inject(AuthState);
  private readonly router = inject(Router);

  readonly loginModel = signal<LoginRequest>({
    email: '',
    password: ''
  });

  readonly loginForm = form(this.loginModel, (path) => {
    required(path.email, {
      message: 'Email is required'
    });

    email(path.email, {
      message: 'Enter a valid email address'
    });

    required(path.password, {
      message: 'Password is required'
    });
  });

  readonly serverError = signal<string | null>(null);


  async onSubmit(event: Event): Promise<void> {
    event.preventDefault();

    this.serverError.set(null);

    await submit(this.loginForm, async (field) => {
      let response: LoginResponse;

      try {
        response = await firstValueFrom(
          this.auth.login(field().value())
        );
      } catch (error) {
        const message = this.getLoginError(error);

        this.serverError.set(message);

        return {
          kind: 'serverError',
          message
        };
      }

      // Login succeeded
      this.authState.setSession(response);

      await this.router.navigateByUrl('/dashboard');

      return undefined; // Explicit successful submission
    });
  }

  private getLoginError(error: unknown): string {
    if (error instanceof HttpErrorResponse) {
      if (error.status === 0) {
        return 'Cannot connect to the server.';
      }

      if (error.status === 401) {
        return 'Invalid email or password.';
      }

      if (error.status === 423) {
        return 'Your account is temporarily locked.';
      }
    }

    return 'Unable to sign in. Please try again.';
  }
}
