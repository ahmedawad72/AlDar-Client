import {
  Component,
  inject,
  signal
} from '@angular/core';

import {
  RouterLink
} from '@angular/router';

import {
  HttpErrorResponse
} from '@angular/common/http';

import {
  firstValueFrom
} from 'rxjs';

import {
  Auth
} from '../../features/auth/services/auth';


@Component({
  selector: 'app-check-email',
  imports: [RouterLink],
  templateUrl: './check-email.html',
  styleUrl: './check-email.scss'
})
export class CheckEmail {

  private readonly auth = inject(Auth);
  readonly email = signal<string | null>(null);
  readonly confirmationEmailSent = signal<boolean | null>(null);
  readonly resending = signal(false);
  readonly resendSucceeded = signal(false);
  readonly resendError = signal<string | null>(null);


  constructor() {

    const state = history.state;

    this.email.set(
      typeof state.email === 'string' ? state.email : null
    );

    this.confirmationEmailSent.set(
      typeof state.confirmationEmailSent === 'boolean' ? state.confirmationEmailSent : null
    );
  }


  async resendConfirmationEmail() {

    const email = this.email();

    if (!email) {
      return;
    }

    this.resendSucceeded.set(false);
    this.resendError.set(null);
    this.resending.set(true);

    try {
      await firstValueFrom(
        this.auth.resendConfirmationEmail({email})
      );

      this.resendSucceeded.set(true);

    } catch (error: unknown) {

      if ( error instanceof HttpErrorResponse && error.status === 0) {

        this.resendError.set('Unable to connect to AlDar. Please try again.');

      } else {

        this.resendError.set('We could not send another email right now. Please try again later.');

      }

    } finally {

      this.resending.set(false);

    }
  }
}