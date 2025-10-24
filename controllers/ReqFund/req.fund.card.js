import { PrismaClient, Role } from "@prisma/client";
import asyncHandler from "express-async-handler";
import {
    sendRequestForCradFunding
} from '../../utils/email/emailtemplate/email.template.js';
import {
  SendingNotification
} from '../../utils/Notification/Notification.js';
const prisma = new PrismaClient();

export const reqForCardFunding = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId, amount } = req.body; 

    if (!cardId || !amount) {
      return res.status(400).json({ error: "Card ID and amount are required" });
    }

    const card = await prisma.card.findUnique({
      where: { id: parseInt(cardId) },
      include: { company: true },
    });

    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (card.companyId !== user.companyId) {
      return res.status(403).json({
        error: "You cannot request funding for cards outside your company",
      });
    }

    if (user.role === Role.ADMIN) { //employee -> admin
      return res.status(403).json({
        error: "Only Employee or TeamLeads can request card funding",
      });
    }

    const fundingRequest = await prisma.cardFundingRequest.create({
      data: {
        cardId: card.id,
        userId: user.id,
        amount: parseFloat(amount),
        status: "PENDING", 
        createdAt: new Date(),
      },
    });

    const approvers = await prisma.user.findMany({
      where: {
        companyId: card.companyId,
        role: { in: [Role.ADMIN, Role.TEAMLEAD] }, //, "SUPERADMIN"
      },
      select: { id: true, email: true, firstName: true },
    });

    for (const approver of approvers) {
      await sendRequestForCradFunding(
        approver.email,           
        approver.firstName,       
        `${user.firstName} ${user.lastName}`,
        parseFloat(amount), 
        card.id,
        card.CardName,
        card.TeamName
      );
       console.log("Sending notifications to approver");

   const sentNotification = await SendingNotification(
      approver.id,
      `${user.firstName} an employee of your orgainization has requested for card funding of card ${card.CardName}.`
    );
    console.log("Notification sent:", sentNotification);
    };

    
    return res.status(201).json({
      success: true,
      message: "Funding request submitted successfully",
      request: fundingRequest,
    });
  } catch (error) {
    console.error("Error in Req for card funding", error);
    return res.status(500).json({
      message: "Error in requesting card funding",
      error: error.message,
    });
  }
});
