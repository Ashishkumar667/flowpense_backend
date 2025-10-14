import prisma from "../../../config/db.js";
import asyncHandler from "express-async-handler";
import { approvalRequestEmailTemplate } from "../../../utils/email/emailtemplate/email.template.js";
import redisClient from "../../../config/cache/redis.js";

export const expenseController = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId, merchant, category, amount, currency } = req.body;
    const numericAmount = Number(amount);

    if (!cardId || !merchant || isNaN(numericAmount) || !currency || !category) {
      return res.status(400).json({
        message: "cardId, merchant, amount, currency and category are required",
      });
    }

    const user = await prisma.user.findUnique({
          where: { id: userId } 
      });

    
    if(user.companyId != req.user.companyId){
      return res.status(403).json({ error: "You can only add expenses within your company" });
    }
    
    if (!user) return res.status(404).json({ 
             error: "User not found"
     });

    const card = await prisma.card.findUnique({
      where: { id: Number(cardId) },
    });

    if (!card) return res.status(404).json({ 
            error: "Card not found" 
          });

    if (card.CardFunding < numericAmount)
      return res.status(400).json({ error: "Insufficient card balance" });

    
    const AUTO_APPROVE_LIMIT = process.env.AUTO_APPROVE_LIMIT
      ? Number(process.env.AUTO_APPROVE_LIMIT)
      : 10000;

    let expenseStatus = numericAmount <= AUTO_APPROVE_LIMIT ? "Approved" : "Pending";
    let autoApproved = expenseStatus === "Approved";

    const expense = await prisma.cardExpense.create({
      data: {
        merchant,
        category,
        Amount: numericAmount,
        currency,
        status: expenseStatus,
        card: { connect: { id: Number(cardId) } },
        user: { connect: { id: userId } },
      },
    });

    if (autoApproved) {
      await prisma.card.update({
        where: { id: Number(cardId) },
        data: { CardFunding: card.CardFunding - numericAmount },
      });
    } else {
      
      const approvers = await prisma.user.findMany({
        where: {
          companyId: card.companyId,
          role: { in: ["TEAMLEAD", "ADMIN"] },
        },
        select: { email: true, firstName: true, lastName: true },
      });

      await Promise.all(
        approvers.map((approver) =>
          approvalRequestEmailTemplate(
            approver.email,
            approver.firstName,
            approver.lastName,
            card.CardName,
            merchant,
            numericAmount,
            expenseStatus
          )
        )
      );
    }

    
    const redisKeys = [
      `transactions:${cardId}`,
      `expenses:card:${cardId}`,
      `expenses:company:${card.companyId}`,
    ];
    try {
      await redisClient.del(redisKeys);
    } catch (err) {
      console.warn("Redis cleanup failed:", err.message);
    }

    return res.status(201).json({
      success: true,
      message: autoApproved
        ? "Expense recorded and auto-approved"
        : "Expense recorded and awaiting approval",
      expense,
    });
  } catch (error) {
    console.error("Error recording expense:", error);
    res.status(500).json({
      error: "Failed to record expense",
      message: error.message,
    });
  }
});



export const getExpenses = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId } = req.params;

    if (!cardId)
      return res.status(400).json({ error: "Card ID is required" });

    const user = await prisma.user.findUnique({ 
          where: { id: userId }  
      });


    if (!user) return res.status(404).json({ 
             error: "User not found" 
        });


    // if (user.role !== "ADMIN")
    //   return res.status(403).json({ error: "Only admin users can access expense data" });

    const redisKey = `expenses:card:${cardId}`;
    const cachedExpenses = await redisClient.get(redisKey);

    if (cachedExpenses) {
      console.log("⚡ Serving expenses from Redis cache");
      return res.status(200).json({
        success: true,
        message: "Fetched from cache",
        expenses: JSON.parse(cachedExpenses),
      });
    }

    const expenses = await prisma.cardExpense.findMany({
      where: {
         cardId: Number(cardId)
         },
      orderBy: { createdAt: "desc" },
    });

    await redisClient.set(redisKey, JSON.stringify(expenses), { EX: 120 });

    res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error on getting expenses:", error);
    res.status(500).json({
      error: "Failed to get expenses",
      message: error.message,
    });
  }
});


export const getAllExpenses = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const companyId = Number(req.user.companyId);

    console.log("User ID:", userId, "Company ID:", companyId);

    const user = await prisma.user.findUnique({ 
      where: { id: userId } 
    });

    if (!user) return res.status(404).json({ 
             error: "User not found"
     });


    if (user.role !== "ADMIN")
      return res.status(403).json({
             error: "Only admin users can access all expenses" 
    });

    const redisKey = `expenses:company:${companyId}`;
    const cachedExpenses = await redisClient.get(redisKey);

    if (cachedExpenses) {
      console.log("⚡ Serving company expenses from Redis");
      return res.status(200).json({
        success: true,
        message: "Fetched from cache",
        expenses: JSON.parse(cachedExpenses),
      });
    }

    
    const expenses = await prisma.cardExpense.findMany({
      where: {
        card: {
          companyId: companyId,
        },
      },
      include: {
        card: {
          select: {
            id: true,
            CardName: true,
            companyId: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    console.log(` Found ${expenses.length} expenses for company ${companyId}`);


    await redisClient.set(redisKey, JSON.stringify(expenses), { EX: 120 });

    res.status(200).json({ success: true, expenses });
  } catch (error) {
    console.error("Error fetching all expenses:", error);
    res.status(500).json({
      error: "Failed to fetch expenses",
      message: error.message,
    });
  }
});
