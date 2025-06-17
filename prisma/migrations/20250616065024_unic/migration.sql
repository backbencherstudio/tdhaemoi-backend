/*
  Warnings:

  - A unique constraint covering the columns `[messageId,userId]` on the table `MessageVisibility` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MessageVisibility_messageId_userId_key" ON "MessageVisibility"("messageId", "userId");
