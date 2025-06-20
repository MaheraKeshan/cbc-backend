import  {createUser, googleLogin, resetPassword} from "../controllers/userController.js";
import express from "express";	
import {loginUser} from "../controllers/userController.js";
import {sendOTP} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google", googleLogin)
userRouter.post("/sent-otp", sendOTP)
userRouter.post("/reset-password", resetPassword) // Assuming this is for sending OTP for password reset

export default userRouter;
