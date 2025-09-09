-- AlterTable
ALTER TABLE "public"."WalletLedger" ADD COLUMN     "receipt_url" TEXT,
ADD COLUMN     "status" TEXT NOT NULL DEFAULT 'pending';
