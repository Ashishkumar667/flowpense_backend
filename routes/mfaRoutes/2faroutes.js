import express from 'express';
import { generate2FaSecret } from '../../controllers/MFA/EnableMFA/2Fa.js';

import { verify2FA } from '../../controllers/MFA/verifyMFA/verify2Fa.controller.js';

import { protectedRoutes } from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/generate-secret', protectedRoutes, generate2FaSecret);

router.post('/verify', protectedRoutes, verify2FA); 

export default router;