import { Router } from "express";
import { listMessages, updateMessage } from "./controller";

const messageRoutes: Router = Router({ mergeParams: true });
messageRoutes.get('/', listMessages);
messageRoutes.put('/:messageId', updateMessage);

export default messageRoutes;
