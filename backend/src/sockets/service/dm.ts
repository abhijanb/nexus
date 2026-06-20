import { prisma } from "../../lib/prisma";
import { AppError } from "../../utils/AppError";

export const dmService = {
    async persistAndFormat(conversationId: string, content: string, senderId: string) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId: senderId } },
            },
            include: { participants: true },
        });

        if (!conversation) {
            throw new AppError("Conversation not found");
        }

        const [message] = await prisma.$transaction([
            prisma.directMessage.create({
                data: { content, conversationId, senderId },
                include: { sender: { select: { id: true, name: true, image: true } } },
            }),
            prisma.conversation.update({
                where: { id: conversationId },
                data: { updatedAt: new Date() },
            }),
        ]);

        return { message, participants: conversation.participants };
    },

    async deleteDirectMessage(userId: string, conversationId: string, messageId: string) {
        const conversation = await prisma.conversation.findFirst({
            where: {
                id: conversationId,
                participants: { some: { userId } },
            },
            include: { participants: true },
        });

        if (!conversation) {
            throw new Error("Conversation not found");
        }

        const message = await prisma.directMessage.findFirst({
            where: { id: messageId, conversationId, senderId: userId },
        });

        if (!message) throw new Error("Message not found");

        await prisma.directMessage.delete({ where: { id: messageId } });

        return { participants: conversation.participants };
    },
};
