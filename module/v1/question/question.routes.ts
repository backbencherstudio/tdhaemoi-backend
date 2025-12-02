import express from "express";
import { getQuestionsFlow, getInsolesQuestions, setInsolesAnswers, getShoesQuestions, setShoesAnswers } from "./question.controllers";
import { questionnaireData } from "./question.data";


const router = express.Router();

// Insoles questionnaire routes
router.get("/insoles/:customerId", getInsolesQuestions);

router.post("/insoles/:customerId", setInsolesAnswers);

router.put("/insoles/:customerId", setInsolesAnswers);


router.get("/shoes/:customerId", getShoesQuestions);

router.post("/shoes/:customerId", setShoesAnswers);

// router.post("/shoes/:customerId", setShoesAnswers);

// router.put("/shoes/:customerId", setShoesAnswers);


// // Shoe questionnaire routes
// router.get("/", getQuestionsFlow);

// router.get("/:categoryTitle", getQuestionsFlow);

// router.get("/:categoryTitle/:subCategoryTitle", getQuestionsFlow);



export default router;
