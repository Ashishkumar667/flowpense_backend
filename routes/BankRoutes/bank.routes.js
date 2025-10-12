import express from 'express';
import { 
    getBank,
    addBank,
    getUserBank

 } from "../../controllers/bankController/bank.js";
 import { 
    protectedRoutes 
 } from '../../middleware/authMiddleware.js';


const router = express.Router();

router.get('/bank', getBank);

router.post('/add-bank',protectedRoutes, addBank);

router.get('/user-Bank',protectedRoutes, getUserBank);

export default router;