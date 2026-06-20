import type { NextFunction, Request, Response } from "express";
import { AppError } from "./AppError";

export class ValidationError extends Error {
    constructor(public errors: { field: string; message: string }[]) {
        super("Validation error");
    }
}

export const errorHandler = (err: unknown, req: Request, res: Response, _next: NextFunction) => {
    try {
        console.error("Error occurred:", err);
        if (err instanceof ValidationError) {
            return res.status(400).json(err.errors);
        }
        if (err instanceof AppError) {
            return res.status(err.statusCode).json({ message: err.message });
        }
        if (err instanceof Error) {
            return res.status(500).json({ message: err.message });
        }
        res.status(500).json({ message: "Internal server error" });
    }
    catch {
        res.status(500).json({ message: "Error handling the error" });
    }
};