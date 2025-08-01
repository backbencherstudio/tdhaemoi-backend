import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";  // Assuming this middleware is handling user authentication
import {
  createEmployee,
  getAllEmployees,
  updateEmployee,
  deleteEmployee,
} from "./employees.controllers";

const router = express.Router();

router.get("/", verifyUser("PARTNER"), getAllEmployees);
router.post("/", verifyUser("PARTNER"), createEmployee);
router.patch("/:id", verifyUser("PARTNER"), updateEmployee);
router.delete("/:id", verifyUser("PARTNER"), deleteEmployee);

export default router;
