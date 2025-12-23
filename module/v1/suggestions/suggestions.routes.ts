import express from "express";
import {
  createSuggestions,
  getAllSuggestions,
  deleteSuggestion,
  deleteAllSuggestions,
  createImprovement,
  getAllImprovements,
  deleteImprovement,
  deleteAllImprovements,
} from "./suggestions.controllers";
import { verifyUser } from "../../../middleware/verifyUsers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.post("/feetf1rst", verifyUser("PARTNER", "ADMIN"), createSuggestions);

router.get("/feetf1rst", verifyUser("PARTNER"), getAllSuggestions);
router.delete("/feetf1rst/:id", verifyUser("PARTNER"), deleteSuggestion);
router.delete("/feetf1rst", verifyUser("PARTNER"), deleteAllSuggestions);


router.post("/improvement", verifyUser("PARTNER", "ADMIN"), upload.array("images", 100), createImprovement);

router.get("/improvement", getAllImprovements);
router.delete("/improvement",  deleteImprovement);
router.delete("/improvement/all", verifyUser("PARTNER"), deleteAllImprovements);

export default router;
