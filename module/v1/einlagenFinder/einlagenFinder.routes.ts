import express from "express";

const router = express.Router();

import { verifyUser } from "../../../middleware/verifyUsers";
import { setEinlagenFinder, getEinlagenFinderAnswers, getEinlagenFinderQuestions, getAnswersByUserId } from "./einlagenFinder.controllers";

router.post("/", verifyUser("PARTNER"), setEinlagenFinder);
router.get("/questions", verifyUser("PARTNER"), getEinlagenFinderQuestions);
router.get("/:customerId", verifyUser("PARTNER"), getEinlagenFinderAnswers);
router.get("/answer/:userId", verifyUser("PARTNER"), getAnswersByUserId);

export default router;
