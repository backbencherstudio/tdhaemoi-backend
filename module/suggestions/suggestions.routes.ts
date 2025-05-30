import express from "express";
import { createSuggestions, getAllSuggestions, deleteSuggestion, deleteAllSuggestions } from "./suggestions.controllers";
import { verifyUser } from "../../middleware/verifyUsers";


const router = express.Router();


router.post("/feetf1rst", verifyUser("PARTNER", "ADMIN"), createSuggestions);

router.get("/feetf1rst", verifyUser("PARTNER"), getAllSuggestions);
router.delete("/feetf1rst:id", verifyUser("PARTNER"), deleteSuggestion);
router.delete("/feetf1rst", verifyUser("PARTNER"), deleteAllSuggestions);



export default router;