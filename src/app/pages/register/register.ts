import { HttpErrorResponse } from '@angular/common/http';
import { Component, computed, inject, signal } from '@angular/core';
import {
  email,
  form,
  FormField,
  minLength,
  pattern,
  required,
  submit,
  validate
} from '@angular/forms/signals';
import { firstValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { Auth }              from '../../features/auth/services/auth';
import { RegisterFormModel } from '../../features/auth/models/register-form-model';
import { RegisterRequest }   from '../../features/auth/models/register-request';

@Component({
  selector: 'app-register',
  imports: [FormField],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {

  private readonly auth = inject(Auth);
  private readonly router = inject(Router);
  readonly registerModel = signal<RegisterFormModel>({
    displayName: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    acceptTerms: false
  });

  readonly passwordRules = computed(() => {
    const password = this.registerModel().password;

    return {
      length: password.length >= 6,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
      symbol: /[^a-zA-Z0-9]/.test(password)
    };
  });

  readonly registerForm = form(
    this.registerModel,
    path => {

      required(path.displayName, {
        message: 'Full name is required'
      });

      required(path.email, {
        message: 'Email is required'
      });

      email(path.email, {
        message: 'Enter a valid email address'
      });

      required(path.password, {
        message: 'Password is required'
      });

      minLength(path.password, 6, {
        message: 'Password must contain at least 6 characters'
      });

      pattern(path.password, /[A-Z]/, {
        message: 'Password must contain an uppercase letter'
      });

      pattern(path.password, /[a-z]/, {
        message: 'Password must contain a lowercase letter'
      });

      pattern(path.password, /[0-9]/, {
        message: 'Password must contain a number'
      });

      pattern(path.password, /[^a-zA-Z0-9]/, {
        message: 'Password must contain a symbol'
      });

      required(path.confirmPassword, {
        message: 'Please confirm your password'
      });

      validate(
        path.confirmPassword,
        ({ value, valueOf }) => {

          const confirmation = value();

          if (!confirmation) {
            return null;
          }

          if (confirmation !== valueOf(path.password)) {
            return {
              kind: 'passwordMismatch',
              message: 'Passwords do not match'
            };
          }

          return null;
        }
      );

      required(path.role);

      required(path.acceptTerms, {
        message: 'You must agree to the Terms and Privacy Policy'
      });
    }
  );

  async onSubmit(event: Event) {

    event.preventDefault();

    await submit(
      this.registerForm,
      async field => {

        const formValue = field().value();

        /*
         * Form model → API request model
         *
         * confirmPassword and acceptTerms
         * intentionally do NOT go to the backend.
         */
        const request: RegisterRequest = {
          displayName: formValue.displayName.trim(),
          email: formValue.email.trim(),
          password: formValue.password,
          role: formValue.role
        };

        try {
          const response = await firstValueFrom(
            this.auth.register(request)
          );

          await this.router.navigate(
            ['/check-email'],
            {
              state: {
                email: response.email,
                confirmationEmailSent:
                  response.confirmationEmailSent
              }
            }
          );

          return;

        } catch (error: unknown) {

          if (error instanceof HttpErrorResponse) {

            if (error.status === 409) {
              return {
                kind: 'emailTaken',
                message:
                  error.error?.detail ??
                  'An account with this email already exists.',
                fieldTree: field.email
              };
            }

            if (error.status === 0) {
              return {
                kind: 'networkError',
                message:
                  'Unable to connect to AlDar. Please try again.'
              };
            }
          }

          return {
            kind: 'serverError',
            message:
              'Something went wrong while creating your account. Please try again.'
          };
        }
      }
    );
  }
}