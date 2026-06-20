-- CreateIndex
CREATE INDEX "Friend_friendId_status_idx" ON "Friend"("friendId", "status");

-- CreateIndex
CREATE INDEX "Friend_userId_status_idx" ON "Friend"("userId", "status");

-- CreateIndex
CREATE INDEX "channel_type_isArchived_idx" ON "channel"("type", "isArchived");

-- CreateIndex
CREATE INDEX "channel_createdById_idx" ON "channel"("createdById");

-- CreateIndex
CREATE INDEX "channel_invite_invitedUserId_status_idx" ON "channel_invite"("invitedUserId", "status");

-- CreateIndex
CREATE INDEX "direct_message_conversationId_id_idx" ON "direct_message"("conversationId", "id");

-- CreateIndex
CREATE INDEX "message_channelId_id_idx" ON "message"("channelId", "id");

-- CreateIndex
CREATE INDEX "notification_userId_isRead_createdAt_idx" ON "notification"("userId", "isRead", "createdAt");

-- CreateIndex
CREATE INDEX "task_status_createdAt_idx" ON "task"("status", "createdAt");
