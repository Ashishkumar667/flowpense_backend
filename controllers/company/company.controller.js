import asyncHandler from 'express-async-handler';
import prisma from '../../config/db.js';
import { 
    registerCompanyService,
    uploadCompanyKycService
} from './companyServices/company.services.js';

export const registerCompany = asyncHandler(async(req, res) => {
    try {
           const { name, rcNumber, tin, country } = req.body;

           if (!name || !rcNumber || !tin || !country) {
             return res.status(400).json({ error: "Missing required fields" });
         }

    const company = await registerCompanyService({
      name,
      rcNumber,
      tin,
      country,
      adminUserId: req.user.id,
    });

    res.status(200).json({ success: true, company });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create company" });
  }
})


export const uploadCompanyKyc = asyncHandler(async(req, res) => {
 try {
    const { companyId, docs, adminBvn } = req.body;

    if (!companyId || !docs || !adminBvn) {
      return res.status(400).json({ error: "Missing KYC fields" });
    }

    const kyc = await uploadCompanyKycService({ companyId, docs, adminBvn });

    res.status(200).json({ success: true, kyc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload KYC" });
  }
})


export const getCompanyDetails = asyncHandler(async( req, res) => {
    try {
        const { companyId } = req.params;

        if(!companyId){
            return res.status(400).json({ error: "Company ID is required"});
        }

        const company = await prisma.company.findUnique({
            where: { id: parseInt(companyId) },
            include: {
                users: {
                    select: {
                        id: true,
                        email: true,
                        name: true,
                        role: true
                    }
                },
                name: true,
                kycStatus: true,
                country: true,
                walletBalance: true
            }
        });

        if(!company){
            return res.status(404).json({ error: "Company not found"});
        }

        res.status(200).json({ success: true, company });
    } catch (error) {
        console.error(err);
        res.status(500).json({ error: "Failed to get comapny details" , error: error.message});
    }
});

export const updateCompany = asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.params;
    const { name, rcNumber, tin, country } = req.body;

    const updatedCompany = await prisma.company.update({
      where: { id: parseInt(companyId) },
      data: {
        ...(name && { name }),
        ...(rcNumber && { rcNumber }),
        ...(tin && { tin }),
        ...(country && { country }),
      },
    });

    res.status(200).json({ success: true, company: updatedCompany });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update company" });
  }
});
