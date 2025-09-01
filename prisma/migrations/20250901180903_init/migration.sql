-- CreateEnum
CREATE TYPE "public"."Role" AS ENUM ('EMPLOYEE', 'SUPERADMIN', 'ADMIN');

-- AlterTable
ALTER TABLE "public"."User" ADD COLUMN     "role" "public"."Role" NOT NULL DEFAULT 'EMPLOYEE';
