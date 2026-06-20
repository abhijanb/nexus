import { prisma } from "./prisma";
// need to understand how to use tsquery and tsvec in raw queries with prisma, so writing helper functions for that
const INDEXES = [
    `CREATE INDEX IF NOT EXISTS idx_message_content_fts ON "message" USING GIN (to_tsvector('english', coalesce(content, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_direct_message_content_fts ON "direct_message" USING GIN (to_tsvector('english', coalesce(content, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_channel_name_fts ON "channel" USING GIN (to_tsvector('english', coalesce(name, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_channel_desc_fts ON "channel" USING GIN (to_tsvector('english', coalesce(description, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_user_name_fts ON "user" USING GIN (to_tsvector('english', coalesce(name, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_task_title_fts ON "task" USING GIN (to_tsvector('english', coalesce(title, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_task_desc_fts ON "task" USING GIN (to_tsvector('english', coalesce(description, '')))`,
    `CREATE INDEX IF NOT EXISTS idx_file_name_fts ON "file" USING GIN (to_tsvector('english', coalesce("originalName", '')))`,
];

export async function setupSearchIndexes() {
    for (const sql of INDEXES) {
        try {
            await prisma.$executeRawUnsafe(sql);
        } catch (err) {
            console.warn(`Search index setup skipped (${sql.slice(0, 60)}...):`, (err as Error).message);
        }
    }
}
