import express from "express";
import {  getAllSuggestions } from "./messages.controllers";
import { verifyUser } from "../../middleware/verifyUsers";


const router = express.Router();


router.get("/", verifyUser("PARTNER"), getAllSuggestions);

export default router;