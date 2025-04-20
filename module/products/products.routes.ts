import express from "express";
import { createProduct, updateProduct, getAllProducts, deleteImage, queryProducts, deleteProduct, getSingleProduct } from "./products.controllers";
import verifyUser from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";
import { isAdmin } from "../../middleware/isAdmin";
 

const router = express.Router();

router.post("/", verifyUser,  upload.array("images", 1000), createProduct);
router.put("/:id", verifyUser,  upload.array("images", 1000), updateProduct);
router.get("/", getAllProducts);
router.delete("/:id/:imageName", verifyUser, deleteImage); 
router.get("/query", queryProducts);
router.delete("/:id", deleteProduct);
router.get("/:id", getSingleProduct); 
export default router;