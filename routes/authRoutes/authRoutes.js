import express from "express";
import {
    registerUser,
    loginUser,
    getUserProfile,
    verifyEmail,
    forgotPass,
    verifyForgotPassOtp,
    resetPassword,
    refreshToken,
    loginUserOTP,
    resendVerificationOtp,
    resendLoginOtp,
    logout,
    deleteAcccount

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

router.post('/refreshToken', refreshToken);

router.post('/logout', protectedRoutes, logout);

router.post('/login-otp', protectedRoutes, loginUserOTP);

router.post('/resend-emailVerif/otp', protectedRoutes, resendVerificationOtp);

router.post('/resend/otp', protectedRoutes, resendLoginOtp );

router.delete('/delete-account', protectedRoutes, deleteAcccount);

export default router;
