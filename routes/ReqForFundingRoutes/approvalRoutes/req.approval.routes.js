import express from 'express';
import {
    protectedRoutes
} from '../../../middleware/authMiddleware.js';

import {
    approveCardFunding
} from '../../../controllers/ReqFund/reqapproval/req.approval.js';

const router = express.Router();

router.post('/card/:requestId', protectedRoutes, approveCardFunding);

export default router;