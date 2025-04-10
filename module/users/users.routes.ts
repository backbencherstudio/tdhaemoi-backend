import express from "express";
import { createUser, loginUser, updateUser, changePassword } from "./users.controllers";
import verifyUser from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";


const router = express.Router();


router.post("/register", upload.single("image"), createUser);
router.post("/login",  loginUser);
router.put("/:id", verifyUser, upload.single("image"), updateUser);
router.patch("/change-password", verifyUser, changePassword);


export default router;