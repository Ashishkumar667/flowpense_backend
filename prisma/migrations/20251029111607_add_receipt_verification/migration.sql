-- AlterTable
ALTER TABLE "public"."CardExpense" ADD COLUMN     "receiptUrl" TEXT,
ADD COLUMN     "verificationNote" TEXT,
ADD COLUMN     "verified" BOOLEAN NOT NULL DEFAULT false;
