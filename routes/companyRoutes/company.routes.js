import express from 'express';
import { 
    registerCompany, 
    uploadCompanyKyc,
    getCompanyDetails,
    updateCompany
} from '../../controllers/company/company.controller.js';
import { protectedRoutes } from '../../middleware/authMiddleware.js';

const router = express.Router();


router.post('/register', protectedRoutes, registerCompany);

router.post('/upload-kyc', protectedRoutes, uploadCompanyKyc);

router.get('/:companyId', getCompanyDetails);

router.patch('/:companyId', protectedRoutes, updateCompany);

export default router;