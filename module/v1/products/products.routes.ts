import express from "express";
import { createProduct, updateProduct, getAllProducts, deleteImage, queryProducts, deleteProduct, getSingleProduct, characteristicsIcons, getCategorizedProducts } from "./products.controllers";

import upload from "../../../config/multer.config";
 
import { verifyUser } from "../../../middleware/verifyUsers";
 

const router = express.Router();

router.post("/", verifyUser("ADMIN"),  upload.array("images", 10000), createProduct);
router.put("/:id", verifyUser("ADMIN"),  upload.array("images", 10000), updateProduct);
router.get("/", getAllProducts);
router.get("/categories", getCategorizedProducts);
router.get("/technical-icons", characteristicsIcons); 
router.delete("/:id/:imageName", verifyUser("ADMIN"), deleteImage); 
router.get("/query", queryProducts);
router.delete("/:id",verifyUser("ADMIN"), deleteProduct);
router.get("/:id",  getSingleProduct); 



export default router;

