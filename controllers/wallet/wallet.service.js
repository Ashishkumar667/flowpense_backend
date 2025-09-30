import prisma from "../../config/db.js";

export const topupWalletService = async ({ companyId, amount, currency, status, receipt_url }) => {

  // const company = await prisma.company.findUnique({
  //   where: { id: companyId },
  // });
  // if (!company) throw new Error("Company not found");

  // const newBalance = company.walletBalance + amount;

  // // update company balance
  // await prisma.company.update({
  //   where: { id: companyId },
  //   data: { walletBalance: newBalance },
  // });

  // // push to ledger 
  // const ledger = await prisma.walletLedger.create({
  //   data: {
  //     companyId,
  //     txType: "credit",
  //     amount,
  //     currency: currency || "NGN",
  //     balanceAfter: newBalance,
  //     status,
  //     receipt_url
  //   },
  // });

  // return { newBalance, ledger };
  return await prisma.$transaction(async (tx) => {
    const existing = await tx.walletLedger.findFirst({
      where: { receipt_url },
    });
    if (existing) {
      throw new Error("Duplicate transaction detected, already processed");
    }

    const updatedCompany = await tx.company.update({
      where: { id: companyId },
      data: {
        walletBalance: { increment: amount }, 
      },
    });

    const ledger = await tx.walletLedger.create({
      data: {
        companyId,
        txType: "credit",
        amount,
        currency: currency || "NGN",
        balanceAfter: updatedCompany.walletBalance,
        status,
        receipt_url,
      },
    });

    return { newBalance: updatedCompany.walletBalance, ledger };
  });
};

export const getWalletLedgerService = async (companyId) => {
  return prisma.walletLedger.findMany({
    where: { companyId },
    orderBy: { createdAt: "desc" },
  });
};
