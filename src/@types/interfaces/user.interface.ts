import { Role, Permission } from "../../constants/model/model.constant";

export interface IUser {
  name: string;
  email: string;
  password?: string;
  role?: Role;
  permissions?: Permission[];
  isEmailVerified?: boolean;
  status?: "active" | "deactive";
}
