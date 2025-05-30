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
import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/feetf1rst", verifyUser("PARTNER", "ADMIN"), createSuggestions);

router.get("/feetf1rst", verifyUser("PARTNER"), getAllSuggestions);
router.delete("/feetf1rst/:id", verifyUser("PARTNER"), deleteSuggestion);
router.delete("/feetf1rst", verifyUser("PARTNER"), deleteAllSuggestions);


router.post("/improvement", verifyUser("PARTNER", "ADMIN"), createImprovement);

router.get("/improvement", verifyUser("PARTNER"), getAllImprovements);
router.delete("/improvement/:id", verifyUser("PARTNER"), deleteImprovement);
router.delete("/improvement", verifyUser("PARTNER"), deleteAllImprovements);

export default router;
