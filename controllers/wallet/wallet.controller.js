import asyncHandler from "express-async-handler";
import { paga } from "../../provider/Paga/paga.js";
import {
  pagaPersistentPayment,
} from "../../provider/Paga/persistentPagaPayment/paga.js";
import {
  topupWalletService,
  getWalletLedgerService,
} from "./wallet.service.js";
import  prisma  from "../../config/db.js";
import crypto from 'crypto'
import dotenv from 'dotenv';
dotenv.config();

//paga
export const createPersistentPayment = asyncHandler(async (req, res) => {
  try {
    const { companyId, amount, email, currency } = req.body; 

    if (!companyId || !email) {
      return res.status(400).json({ error: "companyId and email are required" });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can top up the wallet" });
    }

    if (req.user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ error: "You cannot top up another company's wallet" });
    }

    const user = await prisma.user.findUnique({ 
      where: { id: req.user.id }
     });
    if (!user) return res.status(404).json({ error: "User not found" });

    const company =  await prisma.company.findUnique({
      where: { id: parseInt(companyId) }
    });

    if (!company) return res.status(404).json({ error: "Company not found" });

    if(company?.VirtualaccountNumber){
       return res.status(200).json({
        success: true,
        message: "Company already has a persistent payment account.",
        data: {
          accountNumber: company.VirtualaccountNumber,
          bankName: company.Bank || "Paga",
        },
      });
    }

    const referenceNumber = `${companyId}-${Date.now()}`;
    const accountReference = `COMP-${companyId}-${Date.now()}`;

    let response;
      const body = {
        referenceNumber,
        accountName: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        lastName: user.lastName,
        accountReference: accountReference || "123467891334",
        phoneNumber: user.mobile,
        callbackUrl: process.env.WEBHOOK_URL || "http://localhost:9091/test-callback",
      };

      console.log("Paga Request Body:", body);
      response = await pagaPersistentPayment.post("/registerPersistentPaymentAccount", body);
    
      await prisma.company.update({
          where: { id: parseInt(companyId) },
            data: {
              VirtualaccountNumber: response.data.accountNumber,
              Bank: response.data.bankName || "Paga",
        },
});

    console.log(" Paga Response:", response.data);
    return res.status(200).json({ 
      success: true, 
      data: response.data 
    });
  } catch (error) {
    console.error(" Error in Payment:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || "Failed to initialize payment with Paga",
    });
  }
});


export const depositToBank = asyncHandler(async(req, res) => {
  try {
    const user = req.user;

    const { companyId, amount, currency} = req.body; 

    if (!companyId || !amount ) {
      return res.status(400).json({ error: "companyId, amount, destinationBankId, destinationBankAccountNumber, and destinationBankAccountName are required" });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can initiate bank deposits" });
    }

    if (user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ error: "You cannot initiate deposits for another company's wallet" });
    }

    const company =  await prisma.company.findUnique({
      where: { id: parseInt(companyId) }
    });
    if (!company) return res.status(404).json({ error: "Company not found" });

    if (!company?.VirtualaccountNumber) {
      return res.status(400).json({ error: "Company does not have a persistent payment account" });
    }

    const referenceNumber = `DepositToBank${companyId}-${Date.now()}`;

    console.log("Initiating Paga Deposit to Bank:", referenceNumber);
    const body = {
      referenceNumber,
      amount,
      currency: currency || "NGN",
      destinationBankUUID: process.env.destinationBankUUID,
      destinationBankAccountNumber: company.VirtualaccountNumber,
    };

    console.log("Paga Deposit Request Body:", body);

    const response = await paga.post("/depositToBank", body);

    console.log(" Paga Deposit Response:", response.data);

    return res.status(200).json({
      success: true,
      data: response.data
    });

  } catch (error) {
    console.error(" Error in Payment:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || "Failed to initialize payment with Paga",
    });
  }
});


//getBank
export const getBanks = asyncHandler(async (req, res) => {
  try {
    const referenceNumber = `GetBanks-${Date.now()}`;
    console.log("Fetching Banks from Paga:", referenceNumber);
    const body = {
      referenceNumber,
    };
    console.log("Paga Get Banks Request Body:", body);  
    const response = await paga.post("/getBanks", body);
    console.log(" Paga Get Banks Response:", response.data);
    return res.status(200).json({
      success: true,
      data: response.data,
    });
  } catch (error) {
    console.error(" Error Fetching Banks:", error.response?.data || error.message);
    return res.status(500).json({
      success: false,
      error: error.response?.data?.message || "Failed to fetch banks from Paga",
    });
  }
});


export const pagaWebhook = asyncHandler(async (req, res) => {
  try {
    // const data = req.body;
     
    // const rawBody = req.body.toString(); 
    // const data = JSON.parse(rawBody);
    // console.log(" Paga Webhook Received:", data);
    //  console.log(" Webhook triggered!");
    //  console.log("Headers:", req.headers);
    //  console.log("Raw Body:", req.body.toString());

    // const hashString = `${data.transactionReference}${data.accountNumber}${data.amount}${process.env.PAGA_HMAC_SECRET}`;
    // const computedHash = crypto.createHash("sha512").update(hashString).digest("hex");

    // if (computedHash.toLowerCase() !== data.hash.toLowerCase()) {
    //   console.warn(" Invalid Paga webhook hash!");
    //   return res.status(400).json({ error: "Invalid signature" });
    // }
    const rawBody = req.body.toString("utf8");
    const data = JSON.parse(rawBody);

    console.log(" Webhook triggered!");
    console.log(" Paga Webhook Received:", data);
    console.log("Headers:", req.headers);
    console.log("Raw Body:", rawBody);

    const expectedHash = crypto
      .createHash("sha512")
      .update(rawBody + process.env.PAGA_CLIENT_SECRET)
      .digest("hex");

    console.log("Received hash:", data.hash);
    console.log("Expected hash:", expectedHash);

    if (data.hash.toLowerCase() !== expectedHash.toLowerCase()) {
      console.warn(" Invalid Paga webhook hash!");
      return res.status(400).json({ error: "Invalid signature" });
    }

    console.log("Paga hash verified!");

    if (data.statusCode === "0" && data.statusMessage.toLowerCase() === "success") {
        const company = await prisma.company.findFirst({
        where: {
            VirtualaccountNumber: data.accountNumber
      }
    })

      if (!company) {
        console.warn("⚠️ No company found for accountNumber:", data.accountNumber);
        return res.sendStatus(200); 
      }

      
      const amount = parseFloat(data.amount.replace(/,/g, ""));
      await topupWalletService({
        companyId: company.id,
        amount,
        currency: "NGN",
        status: "success",
        receipt_url: data.transactionReference,
      });

      console.log(` Wallet credited for company ${company.id} with ₦${amount}`);
    } else {
      console.warn(" Non-success status received:", data.statusMessage);
    }

    res.sendStatus(200);
  } catch (error) {
    console.error(" Paga Webhook Error:", error.message);
    res.status(500).json({ error: "Webhook handling failed" });
  }
});




export const getWalletLedger = asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const ledger = await getWalletLedgerService(parseInt(companyId));
    res.status(200).json({ success: true, ledger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wallet ledger" });
  }
});
 