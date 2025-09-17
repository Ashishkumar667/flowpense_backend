import express from 'express';
import {
    googleIOSMobileLogin,
    googleMobileLogin
} from '../../controllers/mobile/googleSignIn.js';

const router = express.Router();

router.post('/google-mobile', googleMobileLogin);
router.post('/google-ios-mobile', googleIOSMobileLogin);

export default router;