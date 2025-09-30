/*
  Warnings:

  - Changed the type of `MonthlyBudget` on the `Team` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "public"."Team" DROP COLUMN "MonthlyBudget",
ADD COLUMN     "MonthlyBudget" INTEGER NOT NULL;
