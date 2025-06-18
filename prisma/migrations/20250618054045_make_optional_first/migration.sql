/*
  Warnings:

  - You are about to drop the column `Company` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `Message` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `Phone` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `Reason` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - Added the required column `email` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firma` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `suggestion` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImprovementSuggestion" DROP COLUMN "Company",
DROP COLUMN "Message",
DROP COLUMN "Phone",
DROP COLUMN "Reason",
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "firma" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "suggestion" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "SuggestionFeetf1rst" ALTER COLUMN "name" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "suggestion" DROP NOT NULL,
ALTER COLUMN "firma" DROP NOT NULL;
