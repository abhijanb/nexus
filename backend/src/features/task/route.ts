import { Router } from "express";
import { createTask, deleteTask, getTask, listTasks, updateTask } from "./controller";
import { authenticate } from "../../middleware/authenticate";

const taskRoutes: Router = Router();
taskRoutes.use(authenticate);
taskRoutes.get("/", listTasks);
taskRoutes.post("/", createTask);
taskRoutes.get("/:id", getTask);
taskRoutes.put("/:id", updateTask);
taskRoutes.delete("/:id", deleteTask);

export default taskRoutes;
