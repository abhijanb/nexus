import { z, type ZodError, type ZodTypeAny } from "zod";
import { ValidationError } from "./errorHandler";

export function validateOrThrow<T extends ZodTypeAny>(schema: T, data: unknown): z.infer<T> {
    const result = schema.safeParse(data);
    if (!result.success) {
            const errors = formatZodErrors(result.error);
            throw new ValidationError(errors);
    }
    return result.data;
}

function formatZodErrors(error: ZodError): { field: string; message: string; code: string }[] {
    return (error as any).issues.map((issue: { path: string[]; message: string; code: string }) => ({
        field: issue.path.length ? issue.path.join(".") : "root",
        message: issue.message,
        code: issue.code,
    }));
}