import express from "express";
import { getQuestionsFlow } from "./question.controllers";


const router = express.Router();


router.get("/:categoryTitle?/:subCategoryTitle?", getQuestionsFlow);

export default router;