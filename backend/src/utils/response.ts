import type { Response } from "express";

type Meta = {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
}

type CursorMeta = {
    nextCursor: string | null;
    hasMore: boolean;
}

export function successResponse<T>(res: Response, data: T, message = "Success", statusCode = 200) {
    return res.status(statusCode).json({
        status: "success",
        message,
        data,
    });
}

export function errorResponse(res: Response, error: unknown, message = "Error", statusCode = 500) {
    return res.status(statusCode).json({
        status: "error",
        message,
        error,
    });
}

export function createdResponse<T>(res: Response, data: T, message = "Resource created successfully") {
    return successResponse(res, data, message, 201);
}

export function paginatedResponse<T>(res: Response, data: T[], meta: Meta, message = "Success") {
    return successResponse(res, { data, meta }, message, 200);
}

export function cursorResponse<T>(res: Response, data: T[], meta: CursorMeta, message = "Success") {
    return successResponse(res, { data, meta }, message, 200);
}

export function noContentResponse(res: Response) {
    return res.status(204).end();
}


