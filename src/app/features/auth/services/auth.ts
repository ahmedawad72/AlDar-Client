import { HttpClient } from '@angular/common/http';
import { inject,Service } from '@angular/core';
import { RegisterRequest } from '../models/register-request';
import { RegisterResponse } from '../models/register-response';
import { developmentEnvironment } from '../../../../environments/environment.development';
import { ConfirmEmailRequest } from '../models/confirm-email-request';
import {ResendConfirmationEmailRequest} from '../models/resend-confirmation-email-request';
@Service()
export class Auth {
    private readonly http = inject (HttpClient);

    register(request: RegisterRequest) {
        return this.http.post<RegisterResponse>
            (`${developmentEnvironment.apiUrl}/api/auth/register`, request);
    }

    // The return type is void because the confirm email endpoint does not return any data, it just confirms the email.
    confirmEmail(request: ConfirmEmailRequest) {
        return this.http.post<void>(
            `${developmentEnvironment.apiUrl}/api/auth/confirm-email`, request);
    }

    resendConfirmationEmail(request: ResendConfirmationEmailRequest) {
        return this.http.post<void>
            (`${developmentEnvironment.apiUrl}/api/auth/resend-confirmation-email`, request);
    }
}
