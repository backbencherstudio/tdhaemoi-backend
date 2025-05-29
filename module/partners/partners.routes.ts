import express from "express";
import {
  createPartnership,
  updatePartnerProfile,
  getAllPartners,
  getPartnerById,
  updatePartnerByAdmin,
  deletePartner,
  forgotPasswordSendOtp,
  forgotPasswordVerifyOtp,
  resetPassword,
  changePassword
} from "./partners.controllers";
import { verifyUser } from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";

const router = express.Router();

router.post("/create", verifyUser("ADMIN"), createPartnership);

router.patch(
  "/update-partner-profile",
  verifyUser("ADMIN", "PARTNER"),
  upload.single("image"),
  updatePartnerProfile
);

router.get("/", verifyUser("ADMIN"), getAllPartners);

router.get("/:id", verifyUser("ADMIN"), getPartnerById);

router.put(
  "/update/:id",
  verifyUser("ADMIN"),
  upload.single("image"),
  updatePartnerByAdmin
);

router.delete("/delete/:id", verifyUser("ADMIN"), deletePartner);
// Forgot Password Routes
router.post("/forgot-password/send-otp", forgotPasswordSendOtp);
router.post("/forgot-password/verify-otp", forgotPasswordVerifyOtp);
router.post("/forgot-password/reset", resetPassword);


// Add this route before the export
router.post("/change-password", verifyUser("PARTNER", "ADMIN"), changePassword);

export default router;
