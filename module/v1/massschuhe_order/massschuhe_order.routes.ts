import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
 
import {
  createMassschuheOrder,
  getMassschuheOrder,
  getMassschuheOrderByCustomerId,
  updateMassschuheOrder,
  deleteMassschuheOrder,
  getMassschuheOrderById,
  updateMassschuheOrderStatus,
  getMassschuheOrderStats,
  getMassschuheRevenueChart,
  getMassschuheFooterAnalysis
} from "./massschuhe_order.controllers";

const router = express.Router();
router.get("/get-by-customer/:customerId", verifyUser("ADMIN", "PARTNER"), getMassschuheOrderByCustomerId);
router.post("/create", verifyUser("ADMIN", "PARTNER"), createMassschuheOrder);
router.get("/", verifyUser("ADMIN", "PARTNER"), getMassschuheOrder);
router.get("/get/:id", verifyUser("ADMIN", "PARTNER"), getMassschuheOrderById);
router.patch("/update-status", verifyUser("ADMIN", "PARTNER"), updateMassschuheOrderStatus);

router.get("/stats", verifyUser("ADMIN", "PARTNER"), getMassschuheOrderStats);
router.get("/stats/revenue", verifyUser("ADMIN", "PARTNER"), getMassschuheRevenueChart);
router.get("/stats/footer-analysis", verifyUser("ADMIN", "PARTNER"), getMassschuheFooterAnalysis);

router.put("/:id", verifyUser("ADMIN", "PARTNER"), updateMassschuheOrder);
router.patch("/:id", verifyUser("ADMIN", "PARTNER"), updateMassschuheOrder);
router.delete("/:id", verifyUser("ADMIN", "PARTNER"), deleteMassschuheOrder);



// router.post("/create", verifyUser("ADMIN", "PARTNER"), createMassschuheOrder);


export default router;
