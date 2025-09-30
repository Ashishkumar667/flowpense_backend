-- CreateTable
CREATE TABLE "public"."Card" (
    "id" SERIAL NOT NULL,
    "CardType" TEXT NOT NULL DEFAULT 'virtual card',
    "CardNumber" TEXT NOT NULL,
    "CardName" TEXT NOT NULL,
    "CardHolder" TEXT[],
    "Approver" TEXT[],
    "TeamName" TEXT NOT NULL,
    "DailySpendLimit" INTEGER NOT NULL,
    "WeeklySpendLimit" INTEGER NOT NULL,
    "MonthlyLimit" INTEGER NOT NULL,
    "PerTransactionLimit" INTEGER NOT NULL,
    "CardFunding" INTEGER NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "BlockedCategory" TEXT[],
    "companyId" INTEGER NOT NULL,

    CONSTRAINT "Card_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public"."CardExpense" (
    "id" SERIAL NOT NULL,
    "merchant" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "Amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cardId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "CardExpense_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Card" ADD CONSTRAINT "Card_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "public"."Company"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardExpense" ADD CONSTRAINT "CardExpense_cardId_fkey" FOREIGN KEY ("cardId") REFERENCES "public"."Card"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public"."CardExpense" ADD CONSTRAINT "CardExpense_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
