import express from 'express';
import { 
    registerCompany, 
    uploadCompanyKyc,
    getCompanyDetails,
    updateCompany
} from '../../controllers/company/company.controller.js';
import { 
    protectedRoutes,
 } from '../../middleware/authMiddleware.js';

 import {     
    upload
 } from '../../middleware/multer.js';

const router = express.Router();


router.post('/register', protectedRoutes, registerCompany);

router.post('/upload-kyc',upload.array("docs", 5), protectedRoutes, uploadCompanyKyc);

router.get('/:companyId',protectedRoutes, getCompanyDetails);

router.patch('/:companyId', protectedRoutes, updateCompany);

export default router;