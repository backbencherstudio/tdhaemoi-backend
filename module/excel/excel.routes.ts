import express from "express";
import { getExcelData } from "./excel.controllers";


const router = express.Router();


router.get("/", getExcelData); // New route for Ex cel data

export default router;