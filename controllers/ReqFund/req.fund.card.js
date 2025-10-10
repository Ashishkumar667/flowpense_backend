import prisma from "../../config/db.js";
import asyncHandler from "express-async-handler";
import {
    sendRequestForCradFunding
} from '../../utils/email/emailtemplate/email.template.js';
import {
  SendingNotification
} from '../../utils/Notification/Notification.js';

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

    if (user.role === "ADMIN") { //employee -> admin
      return res.status(403).json({
        error: "Only Employee or TeamLeads can request card funding",
      });
    }

    const fundingRequest = await prisma.cardFundingRequest.create({
      data: {
        cardId: card.id,
        userId: user.id,
        amount: parseFloat(amount),
        status: "PENDING", // PENDING | APPROVED | REJECTED
      },
    });

    const approvers = await prisma.user.findMany({
      where: {
        companyId: card.companyId,
        role: { in: ["ADMIN"] }, //, "SUPERADMIN"
      },
      select: { email: true, firstName: true },
    });

    for (const approver of approvers) {
      await sendRequestForCradFunding(
        approver.email,           
        approver.firstName,       
        `${user.firstName} ${user.lastName}`, 
        card.id,
        card.CardName,
        card.TeamName
      );
    };
    console.log("Sending notifications to approver");

   const sentNotification = await SendingNotification(
      approvers.id,
      `Your funding request for card ${card.CardName} has been submitted and is pending approval.`
    );

    console.log("Notification sent:", sentNotification);
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
