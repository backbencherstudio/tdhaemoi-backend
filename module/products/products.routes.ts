import express from "express";
import { createProduct, updateProduct, getAllProducts, deleteImage } from "./products.controllers";
import verifyUser from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";
import { isAdmin } from "../../middleware/isAdmin";
 

const router = express.Router();

router.post("/", verifyUser,  upload.array("images", 10), createProduct);
router.put("/:id", verifyUser,  upload.array("images", 10), updateProduct);
router.get("/", getAllProducts);
router.delete("/:id/:imageName", verifyUser, deleteImage); 

export default router;