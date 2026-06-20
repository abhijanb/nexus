import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../../generated/prisma/client";

const connectionString = `${process.env.DATABASE_URL}`;
const poolSize = Number(process.env.DB_POOL_SIZE) || 10;
const poolIdleTimeout = Number(process.env.DB_POOL_IDLE_TIMEOUT) || 30_000;
const poolConnectionTimeout = Number(process.env.DB_POOL_CONNECTION_TIMEOUT) || 10_000;

const adapter = new PrismaPg({
    connectionString,
    max: poolSize,
    idleTimeoutMillis: poolIdleTimeout,
    connectionTimeoutMillis: poolConnectionTimeout,
});
const prisma = new PrismaClient({ adapter });

export { prisma };