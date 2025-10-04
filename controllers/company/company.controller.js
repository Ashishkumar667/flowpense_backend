import asyncHandler from 'express-async-handler';
import prisma from '../../config/db.js';
import { 
    registerCompanyService,
    uploadCompanyKycService
} from './companyServices/company.services.js';
import {
  paystack 
} from '../../provider/paystack/paystack.js';

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

    const adminUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { email: true, firstName: true, lastName: true, mobile: true },
    });

    if (!adminUser) {
      return res.status(404).json({ error: "Admin user not found" });
    }

    
    const paystackResponse = await paystack.post("/customer", {
      email: adminUser.email,
      first_name: adminUser.firstName || name,
      last_name: adminUser.lastName || "Admin",
      phone: adminUser.mobile || undefined,
    });
    console.log("paystackResponse", paystackResponse);

    const customerCode = paystackResponse.data?.data?.customer_code;
    console.log("customer",customerCode);

    if (!customerCode) {
      return res.status(500).json({ error: "Failed to create Paystack customer" });
    }

    
    const updatedCompany = await prisma.company.update({
      where: { id: company.id },
      data: { paystackCustomerCode: customerCode },
    });

    res.status(200).json({ success: true,  company: updatedCompany, });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to create company" });
  }
});


export const uploadCompanyKyc = asyncHandler(async(req, res) => {
 try {
        const {
      companyId,
      adminBvn,
      accountNumber,
      bankCode,
      registeredCompanyName,
      TradingName,
      BusinessType,
      Industry,
      RegisteredNo,
      DateofInc,
      EmployeeNo,
      Website,
      Description,
      FullName,
      Email,
      Role,
      PhoneNo,
      TIN,
      VAT,
      CAC,
      BankName,
      Currency,
      reviewerId
    } = req.body;
    const files = req.files;
    console.log("kyc details", companyId, adminBvn, files);

    if (!companyId || !files?.length || !adminBvn || !accountNumber || !bankCode) {
      return res.status(400).json({ error: "Missing KYC fields" });
    };
    //console.log("companyId", companyId);

    const parsedcompanyid = parseInt(req.body.companyId,10 );
    const parsedReviewerId =  parseInt(req.body.reviewerId, 10);

    //console.log("companyid", parsedcompanyid);

    if (isNaN(parsedcompanyid)) {
      return res.status(400).json({ error: "Invalid company ID" });
    }

    const docs = files.map(file => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype
    }));
    
    console.log("docs", docs);

    const kyc = await uploadCompanyKycService({
      companyId: parsedcompanyid,
      docs,
      adminBvn,
      accountNumber,
      bankCode,
      registeredCompanyName,
      TradingName,
      BusinessType,
      Industry,
      RegisteredNo,
      DateofInc,
      EmployeeNo,
      Website,
      Description,
      FullName,
      Email,
      Role,
      PhoneNo,
      TIN,
      VAT,
      CAC,
      BankName,
      Currency,
      reviewerId : parsedReviewerId
    });

    const companyInfo = await prisma.company.findUnique({
      where: {id: parsedcompanyid},
      select:{
        name:true,
        paystackCustomerCode:true
      }
      
    })

    try {
      const response = await paystack.post(`/customer/${companyInfo.paystackCustomerCode}/identification`,
        {
          country: "NG",
          type: "bank_account",
          account_number: accountNumber,
          bvn: adminBvn,
          bank_code: bankCode,
          first_name: companyInfo.name,
        },
      );

      console.log("Response from paystack for kyc status", response); //debug

      if(response.data.status == true){

        await prisma.companyKyc.update({
          where: {companyId: parsedcompanyid},
          data: {status: "verified"}
        })

        //update company model for kyc verififcation
         await prisma.company.update({
          where: { id: parsedcompanyid},
          data: { kycStatus: "verified"}
         })

      }else{

        await prisma.company.update({
          where: { id: parsedcompanyid},
          data: { kycStatus: "Rejected"}
         });
        
      }
    } catch (err) {
      console.error("Paystack verification error:", err.response?.data || err.message);
      return res.status(500).json({ error: "BVN verification failed", details: err.response?.data || err.message });
    }

    res.status(200).json({ success: true, kyc });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to upload KYC" });
  }
});


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
                    firstName: true,
                    lastName: true,
                    role: true
               }
          },
                 companyKyc: true,
                 walletLedger: true
            }
        });

        if(!company){
            return res.status(404).json({ error: "Company not found"});
        }

        res.status(200).json({ success: true, company });
    } catch (error) {
        console.error(error);
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
