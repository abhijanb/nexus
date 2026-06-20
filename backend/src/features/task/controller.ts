import type { RequestHandler } from "express";
import { asyncHandler } from "../../middleware/asyncHandler";
import { validateOrThrow } from "../../utils/validate";
import { service } from "./service";
import { createTaskSchema, listTasksSchema, taskIdSchema, updateTaskSchema } from "./schema";
import { createdResponse, noContentResponse, paginatedResponse, successResponse } from "../../utils/response";

export const createTask: RequestHandler = asyncHandler(async (req, res) => {
    const payload = validateOrThrow(createTaskSchema, req.body);
    const task = await service.create(req.user!.id, payload);
    createdResponse(res, task, "Task created successfully");
});

export const listTasks: RequestHandler = asyncHandler(async (req, res) => {
    const query = validateOrThrow(listTasksSchema, req.query);
    const result = await service.list(req.user!.id, query);
    paginatedResponse(res, result.tasks, result.meta, "Tasks retrieved successfully");
});

export const getTask: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(taskIdSchema, req.params);
    const task = await service.getById(params.id);
    successResponse(res, task, "Task retrieved successfully");
});

export const updateTask: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(taskIdSchema, req.params);
    const payload = validateOrThrow(updateTaskSchema, req.body);
    const task = await service.update(req.user!.id, params.id, payload);
    successResponse(res, task, "Task updated successfully");
});

export const deleteTask: RequestHandler = asyncHandler(async (req, res) => {
    const params = validateOrThrow(taskIdSchema, req.params);
    await service.delete(req.user!.id, params.id);
    noContentResponse(res);
});
