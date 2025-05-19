import express from "express";
import { createUser, loginUser, updateUser, changePassword } from "./users.controllers";
import { verifyUser } from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";


const router = express.Router();


router.post("/register", upload.single("image"), createUser);
router.post("/login",  loginUser);
router.put("/", verifyUser('ANY'), upload.single("image"), updateUser);
router.patch("/change-password", verifyUser('ANY'), changePassword);




export default router;