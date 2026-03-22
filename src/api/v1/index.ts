import express from "express";

import authrouter from "./routes/auth.route";
import userrouter from "./routes/user.route";
const app = express();

const v1router=express.Router();

v1router.use("/auth",authrouter);
v1router.use("/user",userrouter);

export default v1router;
