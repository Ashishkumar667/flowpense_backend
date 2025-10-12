-- CreateTable
CREATE TABLE "public"."Bank" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "AccountNumber" INTEGER NOT NULL,
    "BankCode" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Bank_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "public"."Bank" ADD CONSTRAINT "Bank_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
