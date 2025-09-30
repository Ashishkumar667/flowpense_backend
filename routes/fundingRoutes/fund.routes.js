import express from 'express';
import {
    fundCardController
}  from '../../controllers/cardMnagement/fundCard/card.funding.js';

import {
    protectedRoutes
} from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post('/card', protectedRoutes, fundCardController);

export default router;