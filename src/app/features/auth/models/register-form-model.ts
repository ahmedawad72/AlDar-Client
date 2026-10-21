
export type AccountRole = 'Student' | 'Teacher';

export interface RegisterFormModel {
  displayName: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: AccountRole;
  acceptTerms: boolean;
}