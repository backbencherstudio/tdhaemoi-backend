import express from "express";
import { getQuestionsFlow } from "./question.controllers";
import { questionnaireData } from "./question.data";

 
const router = express.Router();

router.get("/", getQuestionsFlow);

router.get("/:categoryTitle", getQuestionsFlow);

router.get("/:categoryTitle/:subCategoryTitle", getQuestionsFlow);
 



export default router;
