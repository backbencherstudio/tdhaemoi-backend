/*
  Warnings:

  - Added the required column `firma` to the `Suggestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `isClient` to the `Suggestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Suggestion" ADD COLUMN     "firma" TEXT NOT NULL,
ADD COLUMN     "isClient" BOOLEAN NOT NULL;
