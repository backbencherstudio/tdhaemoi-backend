import express from "express";
import { createSuggestions, getAllSuggestions, deleteSuggestion } from "./suggestions.controllers";
import { verifyUser } from "../../middleware/verifyUsers";


const router = express.Router();


router.post("/", verifyUser("PARTNER"), createSuggestions);

router.get("/", verifyUser("PARTNER"), getAllSuggestions);
router.delete("/:id", verifyUser("PARTNER"), deleteSuggestion);

export default router;