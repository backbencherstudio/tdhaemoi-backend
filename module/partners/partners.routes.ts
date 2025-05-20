
import express from "express";
import { createPartnership, updatePartnerProfile, getAllPartners, getPartnerById, updatePartnerByAdmin, deletePartner} from "./partners.controllers";
import { verifyUser } from "../../middleware/verifyUsers";
import upload from "../../config/multer.config";


const router = express.Router();

router.post("/create", verifyUser('ADMIN'), createPartnership)

router.patch("/update-partner-profile", verifyUser('ADMIN', 'PARTNER'), upload.single("image"), updatePartnerProfile)

router.get("/", verifyUser('ADMIN'), getAllPartners);

router.get("/:id", verifyUser('ADMIN'), getPartnerById);

router.put("/update/:id", verifyUser('ADMIN'), upload.single("image"), updatePartnerByAdmin);

router.delete("/delete/:id", verifyUser('ADMIN'), deletePartner);

export default router;