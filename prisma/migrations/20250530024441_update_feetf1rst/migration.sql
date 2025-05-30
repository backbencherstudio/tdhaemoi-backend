/*
  Warnings:

  - You are about to drop the `Suggestion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "Suggestion" DROP CONSTRAINT "Suggestion_userId_fkey";

-- DropTable
DROP TABLE "Suggestion";

-- CreateTable
CREATE TABLE "SuggestionFeetf1rst" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "suggestion" TEXT NOT NULL,
    "firma" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SuggestionFeetf1rst_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SuggestionFeetf1rst" ADD CONSTRAINT "SuggestionFeetf1rst_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
