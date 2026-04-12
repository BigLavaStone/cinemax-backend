import express from 'express';
import { checkAuth, login,signup, updateProfile, forgotPassword, resetPassword } from '../controllers/userController.js';
import { protectRoutes } from '../middleware/auth.js';




const userRouter = express.Router();

userRouter.post('/signup',signup);
userRouter.post('/login',login);
userRouter.put('/update-profile',protectRoutes,updateProfile);
userRouter.get('/check',protectRoutes,checkAuth);
userRouter.post('/forgot-password',forgotPassword);
userRouter.post('/reset-password/:token',resetPassword);

export default userRouter;


