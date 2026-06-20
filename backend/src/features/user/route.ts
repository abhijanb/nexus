import { Router } from "express";
import { searchUser, updateProfile } from "./controller";
import { authenticate } from "../../middleware/authenticate";

const userRoutes: Router = Router();
userRoutes.get("/search", authenticate, searchUser);
userRoutes.put("/profile", authenticate, updateProfile);
export default userRoutes;