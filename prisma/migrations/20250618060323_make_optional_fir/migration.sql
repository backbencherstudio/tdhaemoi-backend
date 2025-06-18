/*
  Warnings:

  - You are about to drop the column `email` on the `SuggestionFeetf1rst` table. All the data in the column will be lost.
  - You are about to drop the column `firma` on the `SuggestionFeetf1rst` table. All the data in the column will be lost.
  - Added the required column `reason` to the `SuggestionFeetf1rst` table without a default value. This is not possible if the table is not empty.
  - Made the column `name` on table `SuggestionFeetf1rst` required. This step will fail if there are existing NULL values in that column.
  - Made the column `phone` on table `SuggestionFeetf1rst` required. This step will fail if there are existing NULL values in that column.
  - Made the column `suggestion` on table `SuggestionFeetf1rst` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "SuggestionFeetf1rst" DROP COLUMN "email",
DROP COLUMN "firma",
ADD COLUMN     "reason" TEXT NOT NULL,
ALTER COLUMN "name" SET NOT NULL,
ALTER COLUMN "phone" SET NOT NULL,
ALTER COLUMN "suggestion" SET NOT NULL;
