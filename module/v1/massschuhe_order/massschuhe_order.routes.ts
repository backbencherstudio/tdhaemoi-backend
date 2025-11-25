import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
 
import {
  createMassschuheOrder,
  getMassschuheOrder,
  getMassschuheOrderByCustomerId,
  updateMassschuheOrder,
  deleteMassschuheOrder,
  getMassschuheOrderById
  
} from "./massschuhe_order.controllers";

const router = express.Router();
router.get("/get-by-customer/:customerId", verifyUser("ADMIN", "PARTNER"), getMassschuheOrderByCustomerId);
router.post("/create", verifyUser("ADMIN", "PARTNER"), createMassschuheOrder);
router.get("/", verifyUser("ADMIN", "PARTNER"), getMassschuheOrder);
router.get("/get/:id", verifyUser("ADMIN", "PARTNER"), getMassschuheOrderById);


router.put("/:id", verifyUser("ADMIN", "PARTNER"), updateMassschuheOrder);
router.patch("/:id", verifyUser("ADMIN", "PARTNER"), updateMassschuheOrder);
router.delete("/:id", verifyUser("ADMIN", "PARTNER"), deleteMassschuheOrder);


// router.post("/create", verifyUser("ADMIN", "PARTNER"), createMassschuheOrder);

export default router;
