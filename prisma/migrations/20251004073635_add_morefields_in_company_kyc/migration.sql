-- AlterTable
ALTER TABLE "public"."CompanyKyc" ADD COLUMN     "BankName" TEXT,
ADD COLUMN     "BusinessType" TEXT,
ADD COLUMN     "CAC" TEXT,
ADD COLUMN     "Currency" TEXT,
ADD COLUMN     "DateofInc" TEXT,
ADD COLUMN     "Description" TEXT,
ADD COLUMN     "Email" TEXT,
ADD COLUMN     "EmployeeNo" TEXT,
ADD COLUMN     "FullName" TEXT,
ADD COLUMN     "Industry" TEXT,
ADD COLUMN     "PhoneNo" TEXT,
ADD COLUMN     "RegisteredNo" TEXT,
ADD COLUMN     "Role" TEXT,
ADD COLUMN     "TIN" TEXT,
ADD COLUMN     "TradingName" TEXT,
ADD COLUMN     "VAT" TEXT,
ADD COLUMN     "Website" TEXT,
ADD COLUMN     "registeredCompanyName" TEXT,
ALTER COLUMN "adminBvnHash" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "public"."CompanyKyc" ADD CONSTRAINT "CompanyKyc_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "public"."User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
