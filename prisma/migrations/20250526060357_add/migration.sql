/*
  Warnings:

  - You are about to drop the column `firma` on the `Suggestion` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Suggestion" DROP COLUMN "firma";

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3),
    "user_id" TEXT NOT NULL,
    "token" TEXT,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
