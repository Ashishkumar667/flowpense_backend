import express from "express";
 import {     
    upload
 } from '../../middleware/multer.js';
import { uploadUserKyc } from "../../controllers/userKyc/user.kyc.js";
import {
    protectedRoutes
} from '../../middleware/authMiddleware.js';

const router = express.Router();

router.post("/user-kyc", upload.array("docs", 5), protectedRoutes, uploadUserKyc);

export default router;
