import { prisma } from "../../../../lib/prisma";
import { AppError } from "../../../../utils/AppError";
import { Errors } from "../../../../utils/errorMessages";

class Service {
    async listMessages(userId: string, channelId: string, cursor?: string, limit: number = 20) {
        const where = {
            channelId,
            channel: {
                members: { some: { userId } },
            },
            ...(cursor ? { id: { lt: cursor } } : {}),
        };

        const messages = await prisma.message.findMany({
            where,
            include: {
                sender: true,
                channel: { select: { name: true, id: true } },
            },
            take: limit + 1,
            orderBy: { id: "desc" },
        });

        const hasMore = messages.length > limit;
        const result = hasMore ? messages.slice(0, limit) : messages;
        const nextCursor = result.at(-1)?.id ?? null;

        return { messages: result, meta: { nextCursor, hasMore } };
    }

    async updateMessage(userId: string, channelId: string, messageId: string, content: string) {
        const message = await prisma.message.findFirst({
            where: { id: messageId, channelId, senderId: userId },
        });
        if (!message) throw new AppError(Errors.MESSAGE_NOT_FOUND, 404);

        const updated = await prisma.message.update({
            where: { id: messageId },
            data: { content, isEdited: true },
            include: { sender: true },
        });
        return updated;
    }
}

const svc = new Service();
export { svc as service };
