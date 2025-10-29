import asyncHandler from "express-async-handler";
import prisma from "../../../config/db.js";
import { extractReceiptPdf } from "../../../utils/OCR/extractPdf.js";
import path from "path";

export const uploadReceipt = asyncHandler(async (req, res) => {
  try {
    const { expenseId } = req.params;
    const userId = req.user.id;

    const expense = await prisma.cardExpense.findUnique({
      where: { id: parseInt(expenseId) },
    });

    if (!expense) return res.status(404).json({ error: "Expense not found" });
    if (expense.userId !== userId)
      return res.status(403).json({ error: "Unauthorized" });

    if (!req.file) return res.status(400).json({ error: "Receipt file required" });

    const filePath = path.resolve(req.file.path);
    console.log(" Uploaded file path:", filePath);

    const extracted = await extractReceiptPdf(filePath);
    if (!extracted)
      return res.status(500).json({ error: "Failed to extract text from receipt" });

    const isMerchantMatch = expense.merchant.toLowerCase().includes((extracted.merchant || "").toLowerCase());
    const isAmountMatch = Math.abs(expense.Amount - (extracted.amount || 0)) <= 5;
    const isCurrencyMatch = expense.currency.toUpperCase() === extracted.currency.toUpperCase();

    const isVerified = isMerchantMatch && isAmountMatch && isCurrencyMatch;

    const updatedExpense = await prisma.cardExpense.update({
      where: { id: expense.id },
      data: {
        receiptUrl: filePath,
        verified: isVerified,
        verificationNote: isVerified
          ? "Receipt verified successfully"
          : "Receipt data mismatch",
      },
    });

    res.status(200).json({
      success: true,
      verified: isVerified,
      message: updatedExpense.verificationNote,
      extractedData: extracted,
      expense: updatedExpense,
    });

  } catch (error) {
    console.error("Error verifying receipt:", error);
    res.status(500).json({
      error: "Receipt verification failed",
      message: error.message,
    });
  }
});
