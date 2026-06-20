import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";
import { Errors } from "../../utils/errorMessages";

class Service {
    private async areFriends(userId: string, otherUserId: string): Promise<boolean> {
        const friendship = await prisma.friend.findFirst({
            where: {
                OR: [
                    { userId, friendId: otherUserId },
                    { userId: otherUserId, friendId: userId },
                ],
                status: "ACCEPTED",
            },
        });
        return friendship !== null;
    }
    async listConversations(userId: string) {
        const conversations = await prisma.conversation.findMany({
            where: {
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                },
                messages: {
                    take: 1,
                    orderBy: { createdAt: "desc" },
                    include: { sender: { select: { id: true, name: true, image: true } } },
                },
            },
            orderBy: { updatedAt: "desc" },
        });

        const unreadCounts = await Promise.all(
            conversations.map((conv) => {
                const myParticipant = conv.participants.find((p) => p.userId === userId);
                const lastReadAt = myParticipant?.lastReadAt;
                return prisma.directMessage.count({
                    where: {
                        conversationId: conv.id,
                        senderId: { not: userId },
                        ...(lastReadAt ? { createdAt: { gt: lastReadAt } } : {}),
                    },
                });
            }),
        );

        return conversations.map((conv, i) => {
            const otherParticipant = conv.participants.find((p) => p.userId !== userId);
            return {
                id: conv.id,
                createdAt: conv.createdAt,
                updatedAt: conv.updatedAt,
                otherUser: otherParticipant?.user ?? null,
                lastMessage: conv.messages[0] ?? null,
                unreadCount: unreadCounts[i] ?? 0,
            };
        });
    }

    async createConversation(userId: string, participantId: string) {
        if (userId === participantId) {
            throw new AppError(Errors.CANNOT_CONVERSE_SELF, 400);
        }

        const friends = await this.areFriends(userId, participantId);
        if (!friends) {
            throw new AppError(Errors.ONLY_FRIENDS_MESSAGE, 403);
        }

        const existing = await prisma.conversation.findFirst({
            where: {
                AND: [
                    { participants: { some: { userId } } },
                    { participants: { some: { userId: participantId } } },
                ],
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                },
            },
        });

        if (existing) {
            const otherParticipant = existing.participants.find((p) => p.userId !== userId);
            return {
                id: existing.id,
                createdAt: existing.createdAt,
                updatedAt: existing.updatedAt,
                otherUser: otherParticipant?.user ?? null,
            };
        }

        const conversation = await prisma.conversation.create({
            data: {
                participants: {
                    createMany: {
                        data: [{ userId }, { userId: participantId }],
                    },
                },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                },
            },
        });

        const otherParticipant = conversation.participants.find((p) => p.userId !== userId);
        return {
            id: conversation.id,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            otherUser: otherParticipant?.user ?? null,
        };
    }

    async getConversation(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId } },
            },
            include: {
                participants: {
                    include: {
                        user: { select: { id: true, name: true, image: true } },
                    },
                },
            },
        });

        if (!conversation) throw new AppError(Errors.CONVERSATION_NOT_FOUND, 404);

        const otherParticipant = conversation.participants.find((p) => p.userId !== userId);
        return {
            id: conversation.id,
            createdAt: conversation.createdAt,
            updatedAt: conversation.updatedAt,
            otherUser: otherParticipant?.user ?? null,
        };
    }

    async listMessages(userId: string, conversationId: string, cursor?: string, limit: number = 20) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId } },
            },
        });

        if (!conversation) throw new AppError(Errors.CONVERSATION_NOT_FOUND, 404);

        const where = {
            conversationId,
            ...(cursor ? { id: { lt: cursor } } : {}),
        };

        const messages = await prisma.directMessage.findMany({
            where,
            include: {
                sender: { select: { id: true, name: true, image: true } },
            },
            take: limit + 1,
            orderBy: { id: "desc" },
        });

        const hasMore = messages.length > limit;
        const result = hasMore ? messages.slice(0, limit) : messages;
        const nextCursor = result.at(-1)?.id ?? null;

        return { messages: result, meta: { nextCursor, hasMore } };
    }

    async deleteConversation(userId: string, conversationId: string) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId } },
            },
        });

        if (!conversation) throw new AppError(Errors.CONVERSATION_NOT_FOUND, 404);

        await prisma.conversation.delete({ where: { id: conversationId } });
    }

    async getConversationParticipants(conversationId: string) {
        const participants = await prisma.dMParticipant.findMany({
            where: { conversationId },
        });
        return participants;
    }

    async updateDirectMessage(userId: string, conversationId: string, messageId: string, content: string) {
        const message = await prisma.directMessage.findFirst({
            where: { id: messageId, conversationId, senderId: userId },
        });
        if (!message) throw new AppError(Errors.MESSAGE_NOT_FOUND, 404);

        const updated = await prisma.directMessage.update({
            where: { id: messageId },
            data: { content, isEdited: true },
            include: { sender: { select: { id: true, name: true, image: true } } },
        });
        return updated;
    }

    async markRead(userId: string, conversationId: string) {
        const participant = await prisma.dMParticipant.findFirst({
            where: { conversationId, userId },
        });

        if (!participant) throw new AppError(Errors.CONVERSATION_NOT_FOUND, 404);

        await prisma.dMParticipant.update({
            where: { id: participant.id },
            data: { lastReadAt: new Date() },
        });
    }
}

export const service = new Service();
