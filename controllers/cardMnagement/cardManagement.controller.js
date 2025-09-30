import prisma from '../../config/db.js';
import { cardCreationEmailTemplate } from '../../utils/email/emailtemplate/email.template.js';
import asyncHandler from 'express-async-handler';
import { createCardServices } from './card.services.js';

const generateCardNumber = () => {
    const segments = [];
    for (let i = 0; i < 4; i++) {
        let segment = '';
        for (let j = 0; j < 4; j++) {
            segment += Math.floor(Math.random() * 10).toString();
        }
        segments.push(segment);
    }
    return segments.join(' ');

}
export const createCardController = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;

        const { cardType, cardName, cardHolder, approver, teamName, dailySpendLimit, weeklySpendLimit, monthlyLimit, perTransactionLimit, cardFunding, blockedCategory } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId}
        })

        if (!user){
            return res.status(404).json({ error: "User not found" });
        }

        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can create cards" });
        }

        if (!cardType || !cardName || !cardHolder || !approver || !teamName|| dailySpendLimit == null || weeklySpendLimit == null || monthlyLimit == null || perTransactionLimit == null ) {
            return res.status(400).json({ error: "Missing required fields" });
        }

    

        const CardNumber = generateCardNumber();
        console.log("Generated Card Number:", CardNumber);
        const card = await createCardServices({ 
                   CardType: cardType,
                    CardNumber,
                   CardName: cardName,
                   CardHolder: cardHolder,
                   Approver: approver,
                  TeamName: teamName,
                  DailySpendLimit: dailySpendLimit,
                  WeeklySpendLimit: weeklySpendLimit,
                  MonthlyLimit: monthlyLimit,
                  PerTransactionLimit: perTransactionLimit,
                  CardFunding: cardFunding,
                  BlockedCategory: blockedCategory,
                  companyId: user.companyId,

         });

        await cardCreationEmailTemplate(user.email, user.firstName, cardName, CardNumber, cardType);

        res.status(200).json({ success: true,message:"Card created successfully", card });

    } catch (error) {
        console.log("Error in createCardController:", error);
        res.status(500).json({ error: "Failed to create card" , message:error.message});
    }
});

export const getAllcards = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId}
        })

        if (!user){
            return res.status(404).json({ error: "User not found" });
        }

        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can access cards" });
        }

        const cards = await prisma.card.findMany();
        const totalCards = cards.length;
        console.log("Total cards:", totalCards); //debug purpose

        res.status(200).json({ success: true,message:"Cards fetched successfully", cards, totalCards });
    } catch (error) {
        console.log("Error in fetching cards:", error);
        res.status(500).json({ error: "Failed to fetch cards" , message:error.message});
    }
})

export const getCardById = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });
        if (!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can access card details" });
        }
        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }

        const card = await prisma.card.findUnique({
            where: { id: parseInt(cardId) }
        });
        if(!card){
            return res.status(404).json({ error: "Card not found" });
        }

        res.status(200).json({ success: true,message:"Card fetched successfully", card });  
    } catch (error) {
        console.log("Error in fetching card by ID:", error);
        res.status(500).json({ error: "Failed to fetch card" , message:error.message});
    }
});

export const blockUnblockCard = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        const { action } = req.body; // 'Active' or 'frozen'

        const user = await prisma.user.findUnique({
            where: { id: userId}
        });
        if (!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can Activate/deactivate cards" });
        }
        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }
        if(!action || (action !== "Active" && action !== "frozen")){
            return res.status(400).json({ error: "Action must be either 'Active' or 'frozen'" });
        }
        const card = await prisma.card.findUnique({
            where: { id: parseInt(cardId) }
        });
        if(!card){
            return res.status(404).json({ error: "Card not found" });
        }
        if(card.status === action){
            return res.status(400).json({ error: `Card is already ${action}` });
        }
        const updatedCard = await prisma.card.update({
            where: { id: parseInt(cardId) },
            data: { status: action }
        });

        res.status(200).json({ success: true,message:`Card ${action} successfully`, card: updatedCard });
    } catch (error) {
        console.log("Error in blocking/unblocking card:", error);
        res.status(500).json({ error: "Failed to update card status" , message:error.message});
    }
});

export const editCardLimits = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        const { dailySpendLimit, weeklySpendLimit, monthlyLimit, perTransactionLimit } = req.body;  
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });
        if (!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can edit card limits" });
        }

        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }
        if (dailySpendLimit == null || weeklySpendLimit == null || monthlyLimit == null || perTransactionLimit == null ) {
            return res.status(400).json({ error: "All limit fields are required" });
        }

        const card = await prisma.card.findUnique({
            where: { id: parseInt(cardId) }
        });
        if(!card){
            return res.status(404).json({ error: "Card not found" });
        }
        const updatedCard = await prisma.card.update({
            where: { id: parseInt(cardId) },
            data: {
                DailySpendLimit: dailySpendLimit,
                WeeklySpendLimit: weeklySpendLimit,
                MonthlyLimit: monthlyLimit,
                PerTransactionLimit:perTransactionLimit
            }
        }); 
        res.status(200).json({ success: true,message:"Card limits updated successfully", card: updatedCard });
    } catch (error) {
        console.log("Error in editing card limits:", error);
        res.status(500).json({ error: "Failed to update card limits" , message:error.message});
    }
});


export const transactionHistory = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const { cardId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });

        if (!user){
            return res.status(404).json({ error: "User not found" });
        }
        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can access transaction history" });
        }

        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }

        const transactions = await prisma.cardExpense.findMany({
                 where: { cardId: parseInt(cardId) },
                 orderBy: { createdAt: 'desc' }
        });
        console.log("Total transactions found:", transactions); //debug purpose

        if (!transactions.length) {
              return res.status(404).json({ error: "No transactions found for this card" });
        }


        res.status(200).json({ success: true,message:"Card transactions fetched successfully", transactions });
    } catch (error) {
        console.log("Error in fetching card transactions:", error);
        res.status(500).json({ error: "Failed to fetch card transactions" , message:error.message});
    }
});

export const deleteCard = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const companyId = req.user.companyId;
        const { cardId } = req.params;
        const user = await prisma.user.findUnique({
            where: { id: userId}
        });

        if (!user){
            return res.status(404).json({ error: "User not found" });
        }   

        if(user.role !== "ADMIN"){
            return res.status(403).json({ error: "Only admin users can delete cards" });
        }

        if(user.companyId !== companyId){
            return res.status(403).json({ error: "You can only delete cards within your company" });
        }

        if(!cardId){
            return res.status(400).json({ error: "Card ID is required" });
        }

        const card = await prisma.card.findUnique({
            where: { id: parseInt(cardId) }
        });

        if(!card){
            return res.status(404).json({ error: "Card not found" });
        }

        await prisma.card.delete({
            where: { id: parseInt(cardId) }
        });

        res.status(200).json({ success: true,message:"Card deleted successfully" });
    } catch (error) {
        console.log("Error in deleting card:", error);
        res.status(500).json({ error: "Failed to delete card" , message:error.message});
    }   
});