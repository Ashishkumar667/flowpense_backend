import prisma from '../../../config/db.js';
import asyncHandler from 'express-async-handler';
import { approvalRequestEmailTemplate } from '../../../utils/email/emailtemplate/email.template.js';
import  redisClient  from '../../../config/cache/redis.js';

export const expenseController = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { cardId, merchant, category, amount, currency } = req.body;
    const numericAmount = Number(amount);

    if (!cardId || !merchant || amount == null || !currency || !category) {
      return res.status(400).json({
        message:
          "cardId, merchant, amount, currency and category are required",
      });
    }

   
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

   
    const card = await prisma.card.findUnique({ where: { id: cardId } });
    if (!card) {
      return res.status(404).json({ error: "Card not found" });
    }

   
    if (card.CardFunding < amount) {
      return res.status(400).json({ error: "Insufficient card balance" });
    }

    let expenseStatus = "Pending"; // default
    let autoApproved = false;

    if (amount <= 10000) {
      
      expenseStatus = "Approved";
      autoApproved = true;

    } else {
      
      expenseStatus = "Pending"; 
    }

    
    const expense = await prisma.cardExpense.create({
      data: {
        merchant,
        category,
        Amount: numericAmount,
        currency,
        status: expenseStatus,
        card: { connect: { id: cardId } },
        user: { connect: { id: userId } },
      },
    });

    
    let updatedCard = null;
    if (autoApproved) {
      const newCardFunding = card.CardFunding - amount;
      updatedCard = await prisma.card.update({
        where: { id: cardId },
        data: { CardFunding: newCardFunding },
      });
    }else {
     
      const approvers = await prisma.user.findMany({
        where: {
          companyId: card.companyId,
          role: { in: ["TEAMLEAD", "ADMIN"] },
        },
        select: { email: true, firstName: true, lastName: true },
      });
    

      for (const approver of approvers) {
        await approvalRequestEmailTemplate(
          approver.email,
          approver.firstName,
          approver.lastName,
          card.CardName,
          merchant,
          amount,
          expenseStatus
        );
        }

    }
    
    //deleting transaction list from redis
    await redisClient.del(`transactions_${cardId}`);

    return res.status(201).json({
      success: true,
      message:
        autoApproved
          ? "Expense recorded and auto-approved"
          : "Expense recorded and awaiting approval",
      expense,
      card: updatedCard || card,
    });
        
} catch (error) {
    console.error("Error recording expense:", error);
    res.status(500).json({
      error: "Failed to record expense",
      message: error.message,
    });
  }
});


export const getExpenses = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;

        const { cardId } = req.params;

        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });

        if (!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can access expense data" });
        }

        
        const cachedExpenses = await redisClient.get('all_expenses');
        if(cachedExpenses){
          console.log("Response from redis....")
          return res.status(200).json({
            success: true,
            Expenses : Json.parse(cachedExpenses)
          });

        };

        const expenses = await prisma.cardExpense.findMany({
            where: { cardId: parseInt(cardId) },
            orderBy: { createdAt: 'desc' }
        });

        await redisClient.set("all_expenses",Json.stringify(expenses), {EX: 120 });
        res.status(200).json({ success: true, expenses });

    } catch (error) {
     console.error("Error on getting expense:", error);
    res.status(500).json({
      error: "Failed to getting expense",
      message: error.message,
    });
    }
});

export const getAllExpenses = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.companyId;
        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        if (user.role !== "ADMIN") {
            return res.status(403).json({ error: "Only admin users can access all expenses" });
        }

        if(user.companyId !== companyId){
            return res.status(403).json({ error: "You can only access expenses within your company" });
        }

        const cachedExpenses = await redisClient.get('all_expenses');
        if(cachedExpenses){
          console.log("Response from redis....")
          return res.status(200).json({
            success: true,
            Expenses : Json.parse(cachedExpenses)
          });

        };

        const expenses = await prisma.cardExpense.findMany({
            orderBy: { createdAt: 'desc' }
        });


        await redisClient.set("all_expenses",Json.stringify(expenses), {EX: 120 });
        res.status(200).json({ success: true, expenses });
    } catch (error) {
        console.error("Error fetching all expenses:", error);
        res.status(500).json({ error: "Failed to fetch expenses", message: error.message });
    }
});