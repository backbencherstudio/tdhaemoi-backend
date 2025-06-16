-- CreateTable
CREATE TABLE "MessageVisibility" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "isFavorite" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MessageVisibility_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "Messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MessageVisibility" ADD CONSTRAINT "MessageVisibility_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
