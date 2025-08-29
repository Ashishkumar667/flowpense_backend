import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    verifyEmail,
    forgotPass,
    verifyForgotPassOtp,
    resetPassword

} from '../../controllers/auth/auth.controller.js';

import { protectedRoutes } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/profile', protectedRoutes, getUserProfile);

router.post('/verify-email',protectedRoutes, verifyEmail);

router.post('/forgot-password', forgotPass);

router.post('/verify/forgot-pass-otp',protectedRoutes, verifyForgotPassOtp);

router.post('/reset-password',protectedRoutes, resetPassword);

export default router;
