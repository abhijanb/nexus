import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { search } from "./controller";

const searchRoutes: Router = Router();
searchRoutes.use(authenticate);
searchRoutes.get("/", search);

export default searchRoutes;
