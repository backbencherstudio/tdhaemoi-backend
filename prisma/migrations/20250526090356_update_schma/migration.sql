/*
  Warnings:

  - You are about to drop the `Account` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Account" DROP CONSTRAINT "Account_user_id_fkey";

-- DropTable
DROP TABLE "Account";

-- CreateTable
CREATE TABLE "account" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "token" TEXT,

    CONSTRAINT "account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
