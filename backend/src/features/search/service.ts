import { prisma } from "../../lib/prisma";
// need to understand how to use tsquery and tsvec in raw queries with prisma, so writing helper functions for that
function tsvec(col: string): string {
    return `to_tsvector('english', coalesce(${col}, ''))`;
}

function tsq(idx: number): string {
    return `plainto_tsquery('english', $${idx})`;
}

function rank(col: string, idx: number): string {
    return `ts_rank(${tsvec(col)}, ${tsq(idx)})`;
}

class Service {
    async search(
        userId: string,
        query: string,
        type: string,
        limit: number,
        filters?: { fromDate?: string | undefined; toDate?: string | undefined; sender?: string | undefined; mimeType?: string | undefined; channelId?: string | undefined },
    ) {
        const results: {
            messages: Array<{ id: string; content: string; channelId: string; channelName: string; senderName: string; createdAt: Date }>;
            channels: Array<{ id: string; name: string; description: string | null }>;
            users: Array<{ id: string; name: string; image: string | null }>;
            tasks: Array<{ id: string; title: string; description: string | null; status: string; key: string; channelId: string | null }>;
            files: Array<{ id: string; originalName: string; storedName: string; mimeType: string; size: number; type: string; createdAt: Date }>;
        } = {
            messages: [],
            channels: [],
            users: [],
            tasks: [],
            files: [],
        };

        const needsChannelAccess = type === "all" || type === "messages" || type === "channels" || type === "tasks";
        const needsConversationAccess = type === "all" || type === "messages";

        const [memberChannelIds, conversationIds] = await Promise.all([
            needsChannelAccess
                ? prisma.channelMember.findMany({ where: { userId }, select: { channelId: true } }).then(r => r.map(c => c.channelId))
                : Promise.resolve([] as string[]),
            needsConversationAccess
                ? prisma.dMParticipant.findMany({ where: { userId }, select: { conversationId: true } }).then(r => r.map(c => c.conversationId))
                : Promise.resolve([] as string[]),
        ]);

        if (type === "all" || type === "messages") {
            const cParams: any[] = [query];
            const cWhere: string[] = [`${tsvec("m.content")} @@ ${tsq(1)}`];

            if (memberChannelIds.length > 0) {
                cWhere.push(`m."channelId" = ANY($${cParams.length + 1}::text[])`);
                cParams.push(memberChannelIds);
            } else {
                cWhere.push("1=0");
            }

            if (filters?.channelId) {
                cWhere.push(`m."channelId" = $${cParams.length + 1}`);
                cParams.push(filters.channelId);
            }

            if (filters?.sender) {
                cWhere.push(`m."senderId" IN (SELECT id FROM "user" WHERE name ILIKE $${cParams.length + 1})`);
                cParams.push(`%${filters.sender}%`);
            }

            if (filters?.fromDate) {
                cWhere.push(`m."createdAt" >= $${cParams.length + 1}`);
                cParams.push(new Date(filters.fromDate));
            }
            if (filters?.toDate) {
                cWhere.push(`m."createdAt" <= $${cParams.length + 1}`);
                cParams.push(new Date(filters.toDate));
            }

            cParams.push(limit);

            const channelMessages = await prisma.$queryRawUnsafe<Array<{
                id: string; content: string; channelId: string; channelName: string; senderName: string; createdAt: Date;
            }>>(
                `SELECT m.id, m.content, m."channelId", ch.name AS "channelName", u.name AS "senderName", m."createdAt"
                 FROM "message" m
                 JOIN "user" u ON u.id = m."senderId"
                 JOIN "channel" ch ON ch.id = m."channelId"
                 WHERE ${cWhere.join(" AND ")}
                 ORDER BY ${rank("m.content", 1)} DESC, m."createdAt" DESC
                 LIMIT $${cParams.length}`,
                ...cParams,
            );

            const dParams: any[] = [query];
            const dWhere: string[] = [`${tsvec("dm.content")} @@ ${tsq(1)}`];

            if (conversationIds.length > 0) {
                dWhere.push(`dm."conversationId" = ANY($${dParams.length + 1}::text[])`);
                dParams.push(conversationIds);
            } else {
                dWhere.push("1=0");
            }

            if (filters?.sender) {
                dWhere.push(`dm."senderId" IN (SELECT id FROM "user" WHERE name ILIKE $${dParams.length + 1})`);
                dParams.push(`%${filters.sender}%`);
            }

            if (filters?.fromDate) {
                dWhere.push(`dm."createdAt" >= $${dParams.length + 1}`);
                dParams.push(new Date(filters.fromDate));
            }
            if (filters?.toDate) {
                dWhere.push(`dm."createdAt" <= $${dParams.length + 1}`);
                dParams.push(new Date(filters.toDate));
            }

            dParams.push(limit);

            const dmMessages = await prisma.$queryRawUnsafe<Array<{
                id: string; content: string; channelId: string; channelName: string; senderName: string; createdAt: Date;
            }>>(
                `SELECT dm.id, dm.content, ''::text AS "channelId", 'Direct Message' AS "channelName", u.name AS "senderName", dm."createdAt"
                 FROM "direct_message" dm
                 JOIN "user" u ON u.id = dm."senderId"
                 WHERE ${dWhere.join(" AND ")}
                 ORDER BY ${rank("dm.content", 1)} DESC, dm."createdAt" DESC
                 LIMIT $${dParams.length}`,
                ...dParams,
            );

            results.messages = [...channelMessages, ...dmMessages];
        }

        if (type === "all" || type === "channels") {
            const params: any[] = [query];
            const where: string[] = [`(${tsvec("name")} @@ ${tsq(1)} OR ${tsvec("description")} @@ ${tsq(1)})`];

            if (memberChannelIds.length > 0) {
                where.push(`id = ANY($${params.length + 1}::text[])`);
                params.push(memberChannelIds);
            } else {
                where.push("1=0");
            }

            params.push(limit);

            results.channels = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; description: string | null }>>(
                `SELECT id, name, description FROM "channel" WHERE ${where.join(" AND ")} ORDER BY ${rank("name", 1)} DESC LIMIT $${params.length}`,
                ...params,
            );
        }

        if (type === "all" || type === "users") {
            const params: any[] = [query, limit];
            results.users = await prisma.$queryRawUnsafe<Array<{ id: string; name: string; image: string | null }>>(
                `SELECT id, name, image FROM "user" WHERE ${tsvec("name")} @@ ${tsq(1)} ORDER BY ${rank("name", 1)} DESC LIMIT $2`,
                ...params,
            );
        }

        if (type === "all" || type === "files") {
            const params: any[] = [query, userId];
            const where: string[] = [`${tsvec("f.\"originalName\"")} @@ ${tsq(1)}`, `f."userId" = $2`];
            let pi = 3;

            if (filters?.mimeType) {
                where.push(`f."mimeType" ILIKE $${pi}`);
                params.push(`%${filters.mimeType}%`);
                pi++;
            }

            params.push(limit);

            const rows = await prisma.$queryRawUnsafe<Array<{
                id: string; originalName: string; storedName: string; mimeType: string; size: number; type: string; createdAt: Date;
            }>>(
                `SELECT f.id, f."originalName", f."storedName", f."mimeType", f.size, f.type, f."createdAt"
                 FROM "file" f
                 WHERE ${where.join(" AND ")}
                 ORDER BY ${rank("f.\"originalName\"", 1)} DESC, f."createdAt" DESC
                 LIMIT $${pi}`,
                ...params,
            );
            results.files = rows;
        }

        if (type === "all" || type === "tasks") {
            const params: any[] = [query];
            const where: string[] = [`(${tsvec("title")} @@ ${tsq(1)} OR ${tsvec("description")} @@ ${tsq(1)})`];

            const taskAccess: string[] = [];
            if (memberChannelIds.length > 0) {
                taskAccess.push(`"channelId" = ANY($${params.length + 1}::text[])`);
                params.push(memberChannelIds);
            }

            const assignedIds = await prisma.taskAssignee.findMany({ where: { userId }, select: { taskId: true } }).then(r => r.map(t => t.taskId));
            if (assignedIds.length > 0) {
                taskAccess.push(`id = ANY($${params.length + 1}::text[])`);
                params.push(assignedIds);
            }

            where.push(taskAccess.length > 0 ? `(${taskAccess.join(" OR ")})` : "1=0");
            params.push(limit);

            results.tasks = await prisma.$queryRawUnsafe<Array<{
                id: string; title: string; description: string | null; status: string; key: string; channelId: string | null;
            }>>(
                `SELECT id, title, description, status, key, "channelId" FROM "task" WHERE ${where.join(" AND ")} ORDER BY ${rank("title", 1)} DESC, "createdAt" DESC LIMIT $${params.length}`,
                ...params,
            );
        }

        return results;
    }
}

export const service = new Service();
