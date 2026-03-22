import {  model } from "mongoose";

import { IUser } from "../@types/interfaces/user.interface";
import  userSchema  from "./schemaDefinitions/user.schema";

const UserModel =  model<IUser>('Users', userSchema);

export default UserModel;