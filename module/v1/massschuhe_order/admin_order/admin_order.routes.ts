import express from "express";
import { verifyUser } from "../../../../middleware/verifyUsers";

import upload from "../../../../config/multer.config";
import { sendToAdminOrder_1,  approveAdminOrder_1 } from "./admin_order.controllers";

//make send to admin a order by partner it's first step
const router = express.Router();

router.post(
  "/send-to-admin-1/:orderId",
  verifyUser("PARTNER"),
  upload.fields([
    { name: "threed_model_right", maxCount: 1 },
    { name: "threed_model_left", maxCount: 1 },
    { name: "invoice", maxCount: 1 },
  ]),
  sendToAdminOrder_1
);


// approve admin 1 order
router.post(
  "/approve-admin-1-order",
  verifyUser("ADMIN"),
  approveAdminOrder_1
);

export default router;
