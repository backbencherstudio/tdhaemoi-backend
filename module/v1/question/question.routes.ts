import express from "express";
import { getQuestionsFlow, getInsolesQuestions, setInsolesAnswers } from "./question.controllers";
import { questionnaireData } from "./question.data";


const router = express.Router();

// Insoles questionnaire routes
router.get("/insoles/:customerId", getInsolesQuestions);

router.post("/insoles/:customerId", setInsolesAnswers);

router.put("/insoles/:customerId", setInsolesAnswers);

// // Shoe questionnaire routes
// router.get("/", getQuestionsFlow);

// router.get("/:categoryTitle", getQuestionsFlow);

// router.get("/:categoryTitle/:subCategoryTitle", getQuestionsFlow);



export default router;
