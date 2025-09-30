import express from 'express';
import {
    approvalController,
    getPendingApprovals,
    getApprovedExpenses,
    getRejectedExpenses,
    getAllExpenses,

} from '../../controllers/Approval/approval.controller.js';
import { protectedRoutes } from '../../middleware/authMiddleware.js';
const router = express.Router();

router.post('/approve-expense', protectedRoutes, approvalController);

router.get('/pending-approvals', protectedRoutes, getPendingApprovals);

router.get('/approved-expenses', protectedRoutes, getApprovedExpenses);

router.get('/rejected-expenses', protectedRoutes, getRejectedExpenses);

router.get('/all-expenses', protectedRoutes, getAllExpenses);

export default router;