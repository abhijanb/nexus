-- CreateTable
CREATE TABLE "file" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "originalName" TEXT NOT NULL,
    "storedName" TEXT NOT NULL,
    "mimeType" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "file_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "message_attachment" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "message_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "direct_message_attachment" (
    "id" TEXT NOT NULL,
    "directMessageId" TEXT NOT NULL,
    "fileId" TEXT NOT NULL,

    CONSTRAINT "direct_message_attachment_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "file_userId_idx" ON "file"("userId");

-- CreateIndex
CREATE INDEX "file_type_createdAt_idx" ON "file"("type", "createdAt");

-- CreateIndex
CREATE INDEX "message_attachment_fileId_idx" ON "message_attachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "message_attachment_messageId_fileId_key" ON "message_attachment"("messageId", "fileId");

-- CreateIndex
CREATE INDEX "direct_message_attachment_fileId_idx" ON "direct_message_attachment"("fileId");

-- CreateIndex
CREATE UNIQUE INDEX "direct_message_attachment_directMessageId_fileId_key" ON "direct_message_attachment"("directMessageId", "fileId");

-- AddForeignKey
ALTER TABLE "file" ADD CONSTRAINT "file_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "message_attachment" ADD CONSTRAINT "message_attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message_attachment" ADD CONSTRAINT "direct_message_attachment_directMessageId_fkey" FOREIGN KEY ("directMessageId") REFERENCES "direct_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "direct_message_attachment" ADD CONSTRAINT "direct_message_attachment_fileId_fkey" FOREIGN KEY ("fileId") REFERENCES "file"("id") ON DELETE CASCADE ON UPDATE CASCADE;
