-- CreateTable
CREATE TABLE "public"."UserKyc" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "country" TEXT NOT NULL DEFAULT 'Nigeria',
    "docs" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserKyc_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserKyc_userId_key" ON "public"."UserKyc"("userId");

-- AddForeignKey
ALTER TABLE "public"."UserKyc" ADD CONSTRAINT "UserKyc_userId_fkey" FOREIGN KEY ("userId") REFERENCES "public"."User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
