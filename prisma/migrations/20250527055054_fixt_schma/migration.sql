/*
  Warnings:

  - Added the required column `isClient` to the `appointment` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointment" ADD COLUMN     "isClient" BOOLEAN NOT NULL;
