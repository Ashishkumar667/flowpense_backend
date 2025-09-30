import express from 'express';
import {
    expenseController,
    getExpenses,
    getAllExpenses,
} from '../../controllers/expense/expenseController/expense.js';
import { protectedRoutes } from '../../middleware/authMiddleware.js';



const router = express.Router();

router.post('/create-expense', protectedRoutes, expenseController);

router.get('/all-expenses', protectedRoutes, getAllExpenses);

router.get('/card/:cardId', protectedRoutes, getExpenses);

export default router;