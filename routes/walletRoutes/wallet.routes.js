import express from 'express';
import { 
    topupWallet,
    getWalletLedger
} from '../../controllers/wallet/wallet.controller.js';

import { protectedRoutes  } from '../../middleware/authMiddleware.js';  

const router = express.Router();

router.post('/topup', protectedRoutes, topupWallet);

router.get("/ledger", protectedRoutes, getWalletLedger);

export default router;