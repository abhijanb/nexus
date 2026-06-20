import { Router } from "express";
import { addMember, deleteMember, listMembers } from "./controller";
import { authenticate } from "../../../../middleware/authenticate";

const memberRoutes: Router = Router({ mergeParams: true });
memberRoutes.use(authenticate);
memberRoutes.get("/", listMembers);
memberRoutes.post("/", addMember);
memberRoutes.delete("/:userId", deleteMember);
export default memberRoutes;