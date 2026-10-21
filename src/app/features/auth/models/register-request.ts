
import{AccountRole} from "./register-form-model";

export interface RegisterRequest {
  email: string;
  password: string;
  displayName: string;
  role: AccountRole;
}