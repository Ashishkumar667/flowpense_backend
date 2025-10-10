import prisma from '../../config/db.js';
import asyncHandler from 'express-async-handler';
import { sendexpenseApprovalEmailTemplate } from '../../utils/email/emailtemplate/email.template.js';

export const approvalController = asyncHandler(async (req, res) => {
    
        try {
    const approverId = req.user.id;
    const { expenseId, action } = req.body; // action: APPROVE or REJECT

    if (!expenseId || !action) {
      return res.status(400).json({ error: "Expense ID and action are required" });
    }

    const approver = await prisma.user.findUnique({ 
      where: { id: approverId } 
    });

    if (!approver) {
      return res.status(404).json({ error: "Approver not found" });
    }
    if (!["ADMIN", "TEAMLEAD"].includes(approver.role)) {
      return res.status(403).json({ error: "Only approvers (ADMIN/TEAMLEAD) can approve expenses" });
    }

    const expense = await prisma.cardExpense.findUnique({
      where: { id: expenseId },
      include: { card: true, user: true },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

     if (expense.card.companyId !== approver.companyId) {
      return res.status(403).json({ error: "You cannot approve another company's expense" });
    }

    if (expense.status !== "Pending") {
      return res.status(400).json({ error: "Expense is not pending approval" });
    }

    let updatedExpense;

    if (action === "APPROVE") {
      if (expense.card.CardFunding < expense.Amount) {
        return res.status(400).json({ error: "Insufficient card balance for approval" });
      }

      await prisma.card.update({
        where: { id: expense.cardId },
        data: { CardFunding: expense.card.CardFunding - expense.Amount },
      });

      updatedExpense = await prisma.cardExpense.update({
        where: { id: expenseId },
        data: { status: "Approved" },
      });
    } else if (action === "REJECT") {
      updatedExpense = await prisma.cardExpense.update({
        where: { id: expenseId },
        data: { status: "Rejected" },
      });
    } else {
      return res.status(400).json({ error: "Invalid action" });
    }


    if (expense.user?.email) {
      await sendexpenseApprovalEmailTemplate(
        expense.user.email,
        expense.user.firstName,
        approver.firstName,
        expense.id,
        expense.merchant,
        expense.Amount,
        updatedExpense.status
      );
    }else {
         console.warn("Skipping email: No user email found for expense", expense.id);
}


    res.status(200).json({
      success: true,
      message: `Expense has been ${updatedExpense.status}`,
      expense: updatedExpense,
    });
  } catch (error) {
    console.log("Error approving expense:", error);
    res.status(500).json({
      error: "Failed to approve/reject expense",
      message: error.message,
    });
  }

});

export const getPendingApprovals = asyncHandler(async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        // console.log("UserId approvals", user);
        // console.log("company id for approvals path", user.companyId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        if (!["ADMIN", "TEAMLEAD"].includes(user.role)) {
              return res.status(403).json({ error: "Only admin and team lead users can access pending approvals" });
          }

        const pendingExpenses = await prisma.cardExpense.findMany({
            where: { 
              status: "Pending",
              card: { companyId: user.companyId }
            },
            orderBy: { createdAt: 'desc' }
        });

        res.status(200).json({ success: true, pendingExpenses });
    } catch (error) {
        console.log("Error fetching pending approvals:", error);
        res.status(500).json({ error: "Failed to fetch pending approvals", message: error.message });
    }
});

export const getApprovedExpenses = asyncHandler(async(req, res) => {
  try {

    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!["ADMIN", "TEAMLEAD"].includes(user.role)) {
      return res.status(403).json({ error: "Only approvers (ADMIN/TEAMLEAD) can access approved expenses" });
    }

    const approvedExpenses = await prisma.cardExpense.findMany({
      where: { 
        status: "Approved",
        card: { companyId: user.companyId },
      },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, approvedExpenses });
    
  } catch (error) {
    console.log("Error fetching approved expenses:", error);
    res.status(500).json({ error: "Failed to fetch approved expenses", message: error.message });
  }
});


export const getRejectedExpenses = asyncHandler(async(req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!["ADMIN", "TEAMLEAD"].includes(user.role)) {
      return res.status(403).json({ error: "Only approvers (ADMIN/TEAMLEAD) can access rejected expenses" });
    }

    const rejectedExpenses = await prisma.cardExpense.findMany({
      where: {
         status: "Rejected",
         card: { companyId: user.companyId },
         },
      orderBy: { createdAt: 'desc' }
    });
    res.status(200).json({ success: true, rejectedExpenses });

  } catch (error) {
    console.log("Error fetching rejected expenses:", error);
    res.status(500).json({ error: "Failed to fetch rejected expenses", message: error.message });
  } 
});


export const getAllExpenses = asyncHandler(async(req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!["ADMIN", "TEAMLEAD"].includes(user.role)) {
      return res.status(403).json({ error: "Only approvers (ADMIN/TEAMLEAD) can access all expenses" });
    }

    const allExpenses = await prisma.cardExpense.findMany({
      where: {
          card: { companyId: user.companyId }
      },
      orderBy: { createdAt: 'desc' }
    });


    res.status(200).json({ success: true, allExpenses });


    
  } catch (error) {
    console.log("Error fetching all expenses:", error);
    res.status(500).json({ error: "Failed to fetch all expenses", message: error.message });
  }
});


export const updateExpenseCount = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!["ADMIN", "TEAMLEAD"].includes(user.role)) {
      return res.status(403).json({ error: "Only approvers (ADMIN/TEAMLEAD) can update expense count" });
    }

    const { expenseId, status } = req.body;

    if (!expenseId || !status) {
      return res.status(400).json({ error: "Expense ID and status are required" });
    }

    const expense = await prisma.cardExpense.findUnique({
      where: { id: expenseId },
      include: { card: true },
    });

    if (!expense) {
      return res.status(404).json({ error: "Expense not found" });
    }

    if (expense.status !== "Pending") {
      return res.status(400).json({ error: "Only pending expenses can be updated" });
    }

    if (expense.card.companyId !== user.companyId) {
      return res.status(403).json({ error: "You cannot update another company's expense" });
    }

    
    let updatedExpense;
    if (status === "Approved") {
      if (expense.card.CardFunding < expense.Amount) {
        return res.status(400).json({ error: "Insufficient card balance for approval" });
      }
      await prisma.card.update({
        where: { id: expense.cardId },
        data: { CardFunding: expense.card.CardFunding - expense.Amount },
      });

      updatedExpense = await prisma.cardExpense.update({
        where: { id: expenseId },
        data: { status: "Approved" },
      });

    } else if (status === "Rejected") {
      updatedExpense = await prisma.cardExpense.update({
        where: { id: expenseId },
        data: { status: "Rejected" },
      });
    }

    res.status(200).json({ success: true, message: `Expense has been ${updatedExpense.status}`, expense: updatedExpense });

  } catch (err) {
    console.log("Error updating expense count:", err);
    res.status(500).json({ error: "Failed to update expense count", message: err.message });
  }
});