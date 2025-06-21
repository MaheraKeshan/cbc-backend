import  {createUser, getUser, googleLogin, resetPassword} from "../controllers/userController.js";
import express from "express";	
import {loginUser} from "../controllers/userController.js";
import {sendOTP} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.post("/login/google", googleLogin)
userRouter.post("/sent-otp", sendOTP)
userRouter.post("/reset-password", resetPassword) 
userRouter.get("/", getUser) 

export default userRouter;
