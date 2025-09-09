import prisma from "../../config/db.js";

export const topupWalletService = async ({ companyId, amount, currency, status, receipt_url }) => {

  const company = await prisma.company.findUnique({
    where: { id: companyId },
  });
  if (!company) throw new Error("Company not found");

  const newBalance = company.walletBalance + amount;

  // update company balance
  await prisma.company.update({
    where: { id: companyId },
    data: { walletBalance: newBalance },
  });

  // push to ledger 
  const ledger = await prisma.walletLedger.create({
    data: {
      companyId,
      txType: "credit",
      amount,
      currency: currency || "NGN",
      balanceAfter: newBalance,
      status,
      receipt_url
    },
  });

  return { newBalance, ledger };
};

export const getWalletLedgerService = async (companyId) => {
  return prisma.walletLedger.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};
