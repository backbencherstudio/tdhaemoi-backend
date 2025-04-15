/*
  Warnings:

  - The `offer` column on the `Product` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Product" DROP COLUMN "offer",
ADD COLUMN     "offer" DOUBLE PRECISION;
