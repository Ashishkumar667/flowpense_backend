import express from 'express';
import {
    expenseController,
    getExpenses,
    getAllExpenses,
} from '../../controllers/expense/expenseController/expense.js';
import { protectedRoutes } from '../../middleware/authMiddleware.js';
import {
    upload
} from '../../middleware/multerRecipts.js';
import { uploadReceipt } from '../../controllers/expense/receipt/receipt.js';



const router = express.Router();

router.post('/create-expense', protectedRoutes, expenseController);

router.get('/all-expenses', protectedRoutes, getAllExpenses);

router.get('/card/:cardId', protectedRoutes, getExpenses);

router.post("/:expenseId/upload-receipt", protectedRoutes, upload.single("receipt"), uploadReceipt);

export default router;