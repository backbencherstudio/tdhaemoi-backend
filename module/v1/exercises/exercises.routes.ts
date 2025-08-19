import express from "express";


import { verifyUser } from "../../../middleware/verifyUsers";
import { getAllexercises, sendExercisesEmail } from "./exercises.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.get("/", getAllexercises);
router.post("/", upload.single('pdf'), sendExercisesEmail);

export default router;
