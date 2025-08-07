import express from "express";

const router = express.Router();

import { verifyUser } from "../../../middleware/verifyUsers";
import { setEinlagenFinder, getEinlagenFinderAnswers, getEinlagenFinderQuestions } from "./einlagenFinder.controllers";

router.post("/", verifyUser("PARTNER"), setEinlagenFinder);
router.get("/questions", verifyUser("PARTNER"), getEinlagenFinderQuestions);
router.get("/:customerId", verifyUser("PARTNER"), getEinlagenFinderAnswers);

export default router;
