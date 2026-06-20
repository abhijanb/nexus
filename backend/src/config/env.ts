import dotenv from 'dotenv';

dotenv.config();
export const env = {
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    DATABASE_URL: process.env.DATABASE_URL as string,
    DATABASE_URL_UNPOOLED: process.env.DATABASE_URL_UNPOOLED,
    DB_POOL_SIZE: Number(process.env.DB_POOL_SIZE) || 10,
    DB_POOL_IDLE_TIMEOUT: Number(process.env.DB_POOL_IDLE_TIMEOUT) || 30_000,
    DB_POOL_CONNECTION_TIMEOUT: Number(process.env.DB_POOL_CONNECTION_TIMEOUT) || 10_000,
    PORT: process.env.PORT || 3000,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID as string,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET as string,
    SMTP_HOST: process.env.SMTP_HOST || "localhost",
    SMTP_PORT: Number(process.env.SMTP_PORT) || 587,
    SMTP_USER: process.env.SMTP_USER || "",
    SMTP_PASS: process.env.SMTP_PASS || "",
    SMTP_FROM: process.env.SMTP_FROM || "noreply@nexus.dev",
    REDIS_HOST: process.env.REDIS_HOST || "127.0.0.1",
    REDIS_PORT: Number(process.env.REDIS_PORT) || 6379,
    AUTH_RATE_LIMIT_MAX: Number(process.env.AUTH_RATE_LIMIT_MAX) || 20,
    API_RATE_LIMIT_MAX: Number(process.env.API_RATE_LIMIT_MAX) || 100,
    RATE_LIMIT_WINDOW_SECONDS: Number(process.env.RATE_LIMIT_WINDOW_SECONDS) || 900,
};

export function validateEnv() {
    const requiredEnvVars = [
        'GOOGLE_CLIENT_ID',
        'GOOGLE_CLIENT_SECRET',
        'DATABASE_URL',
        'BETTER_AUTH_URL',
        'BETTER_AUTH_SECRET',
        'FRONTEND_URL',
        'GITHUB_CLIENT_ID',
        'GITHUB_CLIENT_SECRET',

    ];

    for (const varName of requiredEnvVars) {
        if (!process.env[varName]) {
            throw new Error(`Environment variable ${varName} is required but not set.`);
        }
    }
}
