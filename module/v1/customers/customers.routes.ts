import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import { assignVersorgungToCustomer, createCustomers, deleteCustomer, getAllCustomers, getCustomerById, searchCustomers, undoAssignVersorgungToCustomer, updateCustomer } from "./customers.controllers";
import upload from "../../../config/multer.config";

const router = express.Router();

router.post(
  "/",
  verifyUser("PARTNER", "ADMIN"),
  upload.fields([
    { name: "picture_10", maxCount: 1 },
    { name: "picture_23", maxCount: 1 },
    { name: "threed_model_left", maxCount: 1 },
    { name: "picture_17", maxCount: 1 },
    { name: "picture_11", maxCount: 1 },
    { name: "picture_24", maxCount: 1 },
    { name: "threed_model_right", maxCount: 1 },
    { name: "picture_16", maxCount: 1 },
    { name: "csvFile", maxCount: 1 },
  ]),
  createCustomers
);


router.get("/", verifyUser("ADMIN", "PARTNER"), getAllCustomers);
router.get("/search", verifyUser("ADMIN", "PARTNER"), searchCustomers);
router.delete("/:id", verifyUser("ADMIN", "PARTNER"), deleteCustomer);

router.patch(
  "/:id",
  verifyUser("PARTNER"),
  upload.fields([
    { name: "picture_10", maxCount: 1 },
    { name: "picture_23", maxCount: 1 },
    { name: "threed_model_left", maxCount: 1 },
    { name: "picture_17", maxCount: 1 },
    { name: "picture_11", maxCount: 1 },
    { name: "picture_24", maxCount: 1 },
    { name: "threed_model_right", maxCount: 1 },
    { name: "picture_16", maxCount: 1 },
    { name: "csvFile", maxCount: 1 },
  ]),
  updateCustomer
);

router.get("/:id", verifyUser("PARTNER", "ADMIN"), getCustomerById);

router.post(
  "/assign-versorgungen/:customerId/:versorgungenId",
  verifyUser("ADMIN", "PARTNER"),
  assignVersorgungToCustomer
);

router.delete(
  "/undo-versorgungen/:customerId/:versorgungenId",
  verifyUser("ADMIN", "PARTNER"),
  undoAssignVersorgungToCustomer
);

export default router;
