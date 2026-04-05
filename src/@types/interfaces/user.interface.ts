

import { Permission } from "../constant/permissions.contant";
import { Role } from "../constant/userRole.constant";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  permissions?: Permission[];
  isEmailVerified?: boolean;
  status?: "active" | "deactive";
}
