import { Router } from "express";
import { acceptRequest, listFriends, listPendingRequests, rejectRequest, removeFriend, sendRequest } from "./controller";
import { authenticate } from "../../middleware/authenticate";

const friendRoutes: Router = Router();
friendRoutes.use(authenticate);
friendRoutes.get("/", listFriends);
friendRoutes.post("/", sendRequest);
friendRoutes.get("/pending", listPendingRequests);
friendRoutes.post("/:id/accept", acceptRequest);
friendRoutes.post("/:id/reject", rejectRequest);
friendRoutes.delete("/:id", removeFriend);

export default friendRoutes;
