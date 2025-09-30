import express from "express";
import {
    createCardController,
    getAllcards,
    getCardById,
    blockUnblockCard,
    editCardLimits,
    transactionHistory,
    deleteCard
} from '../../controllers/cardMnagement/cardManagement.controller.js';

import {
    fundCardController
} from '../../controllers/cardMnagement/fundCard/card.funding.js';

import {
    protectedRoutes
} from '../../middleware/authMiddleware.js';

const router = express.Router();


router.post('/create-card',protectedRoutes, createCardController);

router.get('/all-cards', protectedRoutes, getAllcards);

router.get('/all-cards/:cardId', protectedRoutes, getCardById);

router.patch('/block-unblock-card/:cardId', protectedRoutes, blockUnblockCard);

router.patch('/edit-card-limits/:cardId', protectedRoutes, editCardLimits); 

router.get('/transaction-history/:cardId', protectedRoutes, transactionHistory);

router.delete('/delete-card/:cardId', protectedRoutes, deleteCard);

// router.post('/fund-card', protectedRoutes, fundCardController);

export default router;