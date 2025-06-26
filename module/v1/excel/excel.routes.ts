import express from "express";
import { getExcelData } from "./excel.controllers";

const router = express.Router();

router.get("/", getExcelData);

export default router;