import prisma from "../../../config/db.js";
import asyncHandler from "express-async-handler";
import { sendEmail } from "../../../utils/email/email.js";
import {
  SendingNotification
} from '../../../utils/Notification/Notification.js';

export const approveCardFunding = asyncHandler(async (req, res) => {
  try {
    const adminId = req.user.id;
    const { requestId } = req.params;
    const { action } = req.body; // "APPROVE" or "REJECT"

    if (!["APPROVE", "REJECT"].includes(action?.toUpperCase())) {
      return res.status(400).json({ error: "Invalid action. Use APPROVE or REJECT" });
    }

    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    if (!admin) return res.status(404).json({ error: "Admin not found" });

    if (!["ADMIN", "SUPERADMIN"].includes(admin.role)) {
      return res.status(403).json({ error: "Only admins can approve funding requests" });
    }

    const fundingRequest = await prisma.cardFundingRequest.findUnique({
      where: { id: parseInt(requestId) },
      include: { card: true, user: true },
    });

    if (!fundingRequest) {
      return res.status(404).json({ error: "Funding request not found" });
    }

    if (fundingRequest.status !== "PENDING") {
      return res.status(400).json({ error: "Request already processed" });
    }

    if (fundingRequest.card.companyId !== admin.companyId) {
      return res.status(403).json({ error: "You can only approve requests within your company" });
    }

    let updatedCard = null;

    if (action.toUpperCase() === "APPROVE") {
      
      updatedCard = await prisma.card.update({
        where: { id: fundingRequest.cardId },
        data: { CardFunding: fundingRequest.card.CardFunding + fundingRequest.amount },
      });

      await prisma.cardFundingRequest.update({
        where: { id: fundingRequest.id },
        data: { status: "APPROVED" },
      });

      
      await sendEmail(
        fundingRequest.user.email,
        "Card Funding Approved - Flowpense",
        `
        <p>Hello ${fundingRequest.user.firstName},</p>
        <p>Your funding request of <b>${fundingRequest.amount}</b> for card <b>${fundingRequest.card.CardName}</b> has been <b>approved</b>.</p>
        <p>New balance: ${updatedCard.CardFunding}</p>
        <p>– The Flowpense Team</p>
        `
      );

    } else {
      await prisma.cardFundingRequest.update({
        where: { id: fundingRequest.id },
        data: { status: "REJECTED" },
      });

     
      await sendEmail(
        fundingRequest.user.email,
        "Card Funding Rejected - Flowpense",
        `
        <p>Hello ${fundingRequest.user.firstName},</p>
        <p>Your funding request of <b>${fundingRequest.amount}</b> for card <b>${fundingRequest.card.CardName}</b> has been <b>rejected</b>.</p>
        <p>– The Flowpense Team</p>
        `
      );
    }

    if(fundingRequest.status === "APPROVED"){
          console.log("Sending notifications to requester");
      
         const sentNotification = await SendingNotification(
            approvers.id,
            `Your funding request for card ${fundingRequest.card} has been approved.`
          );
      
          console.log("Notification sent:", sentNotification);
    }else{
      console.log("Sending notifications to requester");
      
         const sentNotification = await SendingNotification(
            approvers.id,
            `Your funding request for card ${fundingRequest.card} has been Rejected.`
          );
      
          console.log("Notification sent:", sentNotification);
    }

    return res.status(200).json({
      success: true,
      message: `Funding request ${action.toUpperCase()}ED successfully`,
      updatedCard,
    });
  } catch (error) {
    console.error("Error approving card funding:", error);
    return res.status(500).json({
      error: "Failed to process funding request",
      message: error.message,
    });
  }
});
