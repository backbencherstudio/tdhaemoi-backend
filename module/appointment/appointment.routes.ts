import express from "express";
import {
  createAppointment,
  getAllAppointments,
  getAppointmentById,
  updateAppointment,
  deleteAppointment,
  getMyAppointments,
} from "./appointment.controllers";

import { verifyUser } from "../../middleware/verifyUsers";

const router = express.Router();

router.post("/", verifyUser("PARTNER", "ADMIN"), createAppointment);

router.get("/", verifyUser("ADMIN"), getAllAppointments);

router.get("/my", verifyUser("PARTNER", "ADMIN"), getMyAppointments);



router.get("/:id", verifyUser("PARTNER", "ADMIN"), getAppointmentById);

router.put("/:id", verifyUser("PARTNER", "ADMIN"), updateAppointment);

router.delete("/:id", verifyUser("PARTNER", "ADMIN"), deleteAppointment);

export default router;
