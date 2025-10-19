import express from 'express';
import { 
    createPersistentPayment,
    getWalletLedger,
    depositToBank,
    getBanks
} from '../../controllers/wallet/wallet.controller.js';

import { protectedRoutes  } from '../../middleware/authMiddleware.js';  

const router = express.Router();

router.post('/create/payment', protectedRoutes, createPersistentPayment);

router.post('/deposit/bank', protectedRoutes, depositToBank);

router.get('/banks',  getBanks);

router.get("/ledger", protectedRoutes, getWalletLedger);

export default router;