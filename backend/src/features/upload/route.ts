import { Router } from "express";
import { upload } from "../../lib/multer";
import { authenticate } from "../../middleware/authenticate";
import { deleteFile, downloadFile, fileUpload, getFile, imageUpload, listFiles } from "./controller";

const uploadRoutes: Router = Router();
uploadRoutes.use(authenticate);

uploadRoutes.get("/", listFiles);
uploadRoutes.get("/download/:type/:filename", downloadFile);
uploadRoutes.post("/image", upload.single("image"), imageUpload);
uploadRoutes.post("/file", upload.array("files"), fileUpload);
uploadRoutes.get("/:id", getFile);
uploadRoutes.delete("/:id", deleteFile);

export default uploadRoutes;
