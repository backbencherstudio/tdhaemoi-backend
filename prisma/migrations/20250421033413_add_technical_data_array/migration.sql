/*
  Warnings:

  - You are about to drop the column `characteristics` on the `Product` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "characteristics",
ADD COLUMN     "technicalData" TEXT;
