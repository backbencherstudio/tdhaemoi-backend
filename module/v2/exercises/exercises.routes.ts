import express from "express";


import { verifyUser } from "../../../middleware/verifyUsers";
import { getAllexercises } from "./exercises.controllers";

const router = express.Router();

router.get("/", getAllexercises);


export default router;
