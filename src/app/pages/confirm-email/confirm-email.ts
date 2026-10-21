import {
  Component,
  inject,
  OnInit,
  signal
} from '@angular/core';

import {
  ActivatedRoute,
  RouterLink
} from '@angular/router';

import { HttpErrorResponse } from '@angular/common/http';

import { firstValueFrom } from 'rxjs';

import { Auth } from '../../features/auth/services/auth';

@Component({
  selector: 'app-confirm-email',
  imports: [RouterLink],
  templateUrl: './confirm-email.html',
  styleUrl: './confirm-email.scss'
})
export class ConfirmEmail implements OnInit {

  private readonly route =
    inject(ActivatedRoute);

  private readonly auth =
    inject(Auth);


  readonly confirming =
    signal(true);

  readonly confirmed =
    signal(false);

  readonly errorMessage =
    signal<string | null>(null);


  async ngOnInit() {

    /*
     * Example:
     *
     * /confirm-email
     * ?userId=123
     * &token=ABC
     */

    const userId =
      this.route.snapshot
        .queryParamMap
        .get('userId');

    const token =
      this.route.snapshot
        .queryParamMap
        .get('token');


    /*
     * If either query parameter is missing,
     * there is nothing useful we can send
     * to the backend.
     */
    if (!userId || !token) {

      this.confirming.set(false);

      this.errorMessage.set(
        'This confirmation link is invalid.'
      );

      return;
    }


    try {

      await firstValueFrom(
        this.auth.confirmEmail({
          userId,
          token
        })
      );

      this.confirmed.set(true);

    } catch (error: unknown) {

      if (error instanceof HttpErrorResponse) {

        const backendMessage =
          error.error?.errors?.Confirmation?.[0]
          ?? error.error?.detail;

        this.errorMessage.set(
          backendMessage ??
          'This confirmation link is invalid or has expired.'
        );

      } else {

        this.errorMessage.set(
          'Something went wrong while confirming your email.'
        );

      }

    } finally {

      this.confirming.set(false);

    }
  }
}