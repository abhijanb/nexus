import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { createConversation, deleteConversation, getConversation, listConversations, listMessages, markConversationRead, updateDirectMessage } from "./controller";

const dmRoutes: Router = Router();
dmRoutes.use(authenticate);

dmRoutes.get("/conversations", listConversations);
dmRoutes.post("/conversations", createConversation);
dmRoutes.get("/conversations/:id", getConversation);
dmRoutes.get("/conversations/:id/messages", listMessages);
dmRoutes.put("/conversations/:id/messages/:messageId", updateDirectMessage);
dmRoutes.delete("/conversations/:id", deleteConversation);
dmRoutes.put("/conversations/:id/read", markConversationRead);

export default dmRoutes;
