-- AlterEnum
ALTER TYPE "public"."Role" ADD VALUE 'TEAMLEAD';

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "mfaEnabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "mfaSecret" TEXT;
