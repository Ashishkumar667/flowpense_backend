import prisma from '../../config/db.js';

export const createCardServices = async ({
  CardType,
  CardNumber,
  CardName,
  CardHolder,
  Approver,
  TeamName,
  DailySpendLimit,
  WeeklySpendLimit,
  MonthlyLimit,
  PerTransactionLimit,
  CardFunding,
  BlockedCategory,
  companyId,
}) => {
  try {
    const card = await prisma.card.create({
      data: {
        CardType,
        CardNumber,
        CardName,
        CardHolder,
        Approver,
        TeamName,
        DailySpendLimit,
        WeeklySpendLimit,
        MonthlyLimit,
        PerTransactionLimit,
        CardFunding,
        BlockedCategory,
        companyId,
      },
    });
    return card;
  } catch (error) {
    console.log('Error creating card:', error);
    throw new Error('Failed to create card');
  }
};
