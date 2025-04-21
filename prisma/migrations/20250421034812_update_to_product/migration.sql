/*
  Warnings:

  - You are about to drop the column `technicalData` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "technicalData",
ADD COLUMN     "characteristics" TEXT;
