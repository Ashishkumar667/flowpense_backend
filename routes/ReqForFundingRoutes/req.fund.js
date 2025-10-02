import express from 'express';
import {
    reqForCardFunding
} from '../../controllers/ReqFund/req.fund.card.js';

import {
    protectedRoutes
} from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/cards', protectedRoutes, reqForCardFunding);

export default router;