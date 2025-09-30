import prisma from '../../../config/db.js';
import asyncHandler from 'express-async-handler';
import { cardFundingEmailTemplate  } from '../../../utils/email/emailtemplate/email.template.js';

export const fundCardController = asyncHandler(async(req, res) => {
    try {
        
        const userId = req.user.id;
        const { cardId, amount, companyId } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        else if (user.role !== "ADMIN" ) {
            return res.status(403).json({ error: "Only admin users can fund cards" });
        }


        if (!cardId || amount == null || !companyId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const card = await prisma.card.findUnique({
            where: { id: cardId }
        });
        if (!card) {
            return res.status(404).json({ error: "Card not found" });
        }

        if (card.companyId !== companyId) {
          return res.status(403).json({ error: "This card does not belong to the provided company" });
        }

        const company = await prisma.company.findUnique({
            where: { id: companyId }
        });

        if(!company) {
            return res.status(404).json({ error: "Company not found" });
        }

        if (company.walletBalance < amount) {
            return res.status(400).json({ error: "Insufficient company balance" });
        }

        const companyNewBalance = company.walletBalance - amount;
        const newCardBalance = (card.CardFunding || 0) + amount;

        const [updatedCard, updatedCompany, ledgerEntry] = await prisma.$transaction([
               prisma.card.update({
                   where: { id: cardId },
                      data: { CardFunding: newCardBalance },
         }),
               prisma.company.update({
                    where: { id: companyId },
                    data: { walletBalance: companyNewBalance },
             }),
               prisma.walletLedger.create({
                  data: {
                     companyId,
                     txType: "card_funding", 
                     amount,
                     currency: "NGN",
                     balanceAfter: companyNewBalance,
                     status: "success",
                     receipt_url: null, 
          },
      }),
    ]);

        await cardFundingEmailTemplate(user.email, user.firstName, card.CardName, amount, newCardBalance);
        
        res.status(200).json({ 
            success: true, 
            message: "Card funded successfully", 
            card: updatedCard,
           companyBalance: updatedCompany.walletBalance,
           ledger: ledgerEntry,
        });
    } catch (error) {
        console.log("Error funding card:", error);
        res.status(500).json({ error: "Failed to fund card" , message: error.message});
    }
});