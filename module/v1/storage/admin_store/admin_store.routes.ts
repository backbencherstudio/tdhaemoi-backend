import express from "express";
import { verifyUser } from "../../../../middleware/verifyUsers";

const router = express.Router();
 
// router.get("/get-store-overview-by-id/:id", verifyUser("PARTNER", "ADMIN"), getStoreOverviewById);

export default router;