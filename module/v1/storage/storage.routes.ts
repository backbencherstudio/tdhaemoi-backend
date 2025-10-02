import express from "express";
import {
  createStorage,
  deleteStorage,
  getAllMyStorage,
 
  updateStorage,
} from "./storage.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";

const router = express.Router();

router.post("/create", verifyUser("PARTNER", "ADMIN"), createStorage);
router.get("/my/get", verifyUser("PARTNER", "ADMIN"), getAllMyStorage);
router.patch("/update/:id", verifyUser("PARTNER", "ADMIN"), updateStorage);
router.delete("/delete/:id", verifyUser("PARTNER", "ADMIN"), deleteStorage);
 
export default router;
