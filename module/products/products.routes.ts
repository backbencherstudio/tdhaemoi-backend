import express from "express";
import { createProduct, updateProduct, getAllProducts, deleteImage, queryProducts, deleteProduct, getSingleProduct, characteristicsIcons } from "./products.controllers";

import upload from "../../config/multer.config";
 
import { verifyUser } from "../../middleware/verifyUsers";
 

const router = express.Router();

router.post("/", verifyUser("ADMIN"),  upload.array("images", 1000), createProduct);
router.put("/:id", verifyUser("ADMIN"),  upload.array("images", 1000), updateProduct);
router.get("/", getAllProducts);
router.get("/technical-icons", characteristicsIcons); 
router.delete("/:id/:imageName", verifyUser("ADMIN"), deleteImage); 
router.get("/query", queryProducts);
router.delete("/:id", deleteProduct);
router.get("/:id", verifyUser("ADMIN"), getSingleProduct); 

export default router;