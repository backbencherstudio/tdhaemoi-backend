import express from "express";
import { verifyUser } from "../../../middleware/verifyUsers";
import {
  assignVersorgungToCustomer,
  createCustomers,
  deleteCustomer,
  getAllCustomers,
  getCustomerById,
  searchCustomers,
  undoAssignVersorgungToCustomer,
  updateCustomer,
  updateCustomerSpecialFields,
  addScreenerFile,
  updateScreenerFile
} from "./customers.controllers";
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
router.patch(
  "/:id/special-fields",
  verifyUser("PARTNER", "ADMIN"),
  updateCustomerSpecialFields
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

router.post(
  "/screener-file/:customerId",
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
  addScreenerFile
);


router.patch(
  "/update-screener-file/:customerId/:screenerId",
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
  updateScreenerFile
);

export default router;

       // "id": "c5f0465d-798e-44eb-a5ce-f79679c13018",
                    // "customerId": "b1a0e066-9d38-4278-8f5d-f235c4289fce",

