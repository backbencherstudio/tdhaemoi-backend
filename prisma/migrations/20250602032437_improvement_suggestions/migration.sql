/*
  Warnings:

  - You are about to drop the column `email` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `firma` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `phone` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `suggestion` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - Added the required column `Company` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Message` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Phone` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `Reason` to the `ImprovementSuggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "ImprovementSuggestion" DROP COLUMN "email",
DROP COLUMN "firma",
DROP COLUMN "name",
DROP COLUMN "phone",
DROP COLUMN "suggestion",
ADD COLUMN     "Company" TEXT NOT NULL,
ADD COLUMN     "Message" TEXT NOT NULL,
ADD COLUMN     "Phone" TEXT NOT NULL,
ADD COLUMN     "Reason" TEXT NOT NULL;
