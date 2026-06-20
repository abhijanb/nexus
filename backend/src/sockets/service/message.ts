import { prisma } from "../../lib/prisma";

export const messageService = {
    async persistAndFormat(channelId: string, content: string, senderId: string) {
        const message = await prisma.message.create({
            data: { channelId, content, senderId },
            include: { sender: true },
        });
        return message;
    },
    async deleteMessage(userId: string, channelId: string, messageId: string) {
        const channel = await prisma.channel.findUnique({ where: { id: channelId } });
        const isOwner = channel?.createdById === userId;

        const message = await prisma.message.findFirst({
            where: {
                id: messageId,
                channelId,
                ...(isOwner ? {} : { senderId: userId }),
            },
        });

        if (!message) throw new Error("Message not found");

        await prisma.message.delete({ where: { id: messageId } });
    },
};
