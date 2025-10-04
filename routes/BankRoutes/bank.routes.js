import express from 'express';
import { getBank } from "../../controllers/bankController/bank.js";

const router = express.Router();

router.get('/bank', getBank);

export default router;