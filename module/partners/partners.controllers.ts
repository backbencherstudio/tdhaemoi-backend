import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import fs from "fs";
import path from "path";
import { baseUrl, getImageUrl } from "../../utils/base_utl";
import {
  generateOTP,
  sendForgotPasswordOTP,
  sendPartnershipWelcomeEmail,
} from "../../utils/emailService.utils";
import validator from "validator";

const prisma = new PrismaClient();

export const createPartnership = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const missingField = ["email", "password"].find(
      (field) => !req.body[field]
    );

    if (missingField) {
      res.status(400).json({
        message: `${missingField} is required!`,
      });
      return;
    }

    const existingPartnership = await prisma.user.findUnique({
      where: { email },
    });

    if (existingPartnership) {
      res.status(400).json({
        message: "Email already exists",
      });
      return;
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const partnership = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role: "PARTNER",
      },
    });

    // Send welcome email with credentials
    sendPartnershipWelcomeEmail(email, password);

    res.status(201).json({
      success: true,
      message: "Partnership created successfully",
      partnership,
    });
  } catch (error) {
    console.error("Partnership creation error:", error);
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const updatePartnerProfile = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { name } = req.body;
    const newImage = req.file;

    const existingUser = await prisma.user.findUnique({
      where: { id: String(id) },
    });

    if (!existingUser) {
      if (newImage) {
        const imagePath = path.join(
          __dirname,
          "../../uploads",
          newImage.filename
        );
        if (fs.existsSync(imagePath)) {
          fs.unlinkSync(imagePath);
        }
      }
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (newImage && existingUser.image) {
      const oldImagePath = path.join(
        __dirname,
        "../../uploads",
        existingUser.image
      );
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }

    const user = await prisma.user.update({
      where: { id: String(id) },
      data: {
        name: name || existingUser.name,
        image: newImage ? newImage.filename : existingUser.image,
      },
    });

    const imageUrl = user.image ? getImageUrl(`/uploads/${user.image}`) : null;

    res.status(200).json({
      success: true,
      message: "Partner profile updated successfully",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: imageUrl,
        role: user.role,
      },
    });
  } catch (error) {
    if (req.file) {
      const imagePath = path.join(
        __dirname,
        "../../uploads",
        req.file.filename
      );
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const getAllPartners = async (req: Request, res: Response) => {
  try {
    const partners = await prisma.user.findMany({
      where: { role: "PARTNER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    const partnersWithImageUrls = partners.map((partner) => ({
      ...partner,
      image: partner.image ? getImageUrl(`/uploads/${partner.image}`) : null,
    }));

    res.status(200).json({
      success: true,
      partners: partnersWithImageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const getPartnerById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await prisma.user.findUnique({
      where: { id, role: "PARTNER" },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        createdAt: true,
      },
    });

    if (!partner) {
      res.status(404).json({
        success: false,
        message: "Partner not found",
      });
    }

    res.status(200).json({
      success: true,
      partner: {
        ...partner,
        image: partner.image ? getImageUrl(`/uploads/${partner.image}`) : null,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const updatePartnerByAdmin = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password } = req.body;
  const newImage = req.file;

  try {
    const user = await prisma.user.findUnique({ where: { id } });

    if (!user || user.role !== "PARTNER") {
      if (newImage) {
        const filepath = path.join(
          __dirname,
          "../../uploads",
          newImage.filename
        );
        if (fs.existsSync(filepath)) fs.unlinkSync(filepath);
      }

      res.status(404).json({
        success: false,
        message: "Partner not found",
      });
      return;
    }

    if (email && email !== user.email) {
      if (!validator.isEmail(email)) {
        res
          .status(400)
          .json({ success: false, message: "Invalid email format" });
        return;
      }

      const existingEmail = await prisma.user.findUnique({ where: { email } });
      if (existingEmail) {
        res
          .status(400)
          .json({ success: false, message: "Email already in use" });
        return;
      }
    }

    let updatedPassword = user.password;
    if (password) {
      if (password.length < 6) {
        res.status(400).json({
          success: false,
          message: "Password must be at least 6 characters",
        });
      }
      updatedPassword = await bcrypt.hash(password, 10);
    }

    if (newImage && user.image) {
      const oldImagePath = path.join(__dirname, "../../uploads", user.image);
      if (fs.existsSync(oldImagePath)) fs.unlinkSync(oldImagePath);
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        name: name || user.name,
        email: email || user.email,
        password: updatedPassword,
        image: newImage ? newImage.filename : user.image,
      },
    });

    res.status(200).json({
      success: true,
      message: "Partner updated successfully",
      partner: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        password,
        role: updated.role,
        image: updated.image ? getImageUrl(`/uploads/${updated.image}`) : null,
      },
    });
  } catch (error) {
    if (newImage) {
      const errorFilePath = path.join(
        __dirname,
        "../../uploads",
        newImage.filename
      );
      if (fs.existsSync(errorFilePath)) fs.unlinkSync(errorFilePath);
    }

    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const deletePartner = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const partner = await prisma.user.findUnique({
      where: { id, role: "PARTNER" },
    });

    if (!partner) {
      res.status(404).json({
        success: false,
        message: "Partner not found",
      });
      return;
    }

    // Delete partner's image if exists
    if (partner.image) {
      const imagePath = path.join(__dirname, "../../uploads", partner.image);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    await prisma.user.delete({
      where: { id },
    });

    res.status(200).json({
      success: true,
      message: "Partner deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const changePasswordSendOtp = async (req: Request, res: Response) => {
  try {
    const { id } = req.user;
    const { email } = req.body;

    if (!email) {
      res.status(400).json({
        message: "Email is required!",
      });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { id },
    });

    if (!user) {
      res.status(404).json({
        message: "User not found",
      });
      return;
    }

    if (user.email !== email) {
      res.status(400).json({
        message: "Email does not match with the logged-in user",
      });
      return;
    }

    // Generate OTP and send it to the user's email
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    // Send OTP to user's email (implement your own email sending logic)
    // await sendOtpEmail(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent to your email",
      otp,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Something went wrong",
      error,
    });
  }
};

export const forgotPasswordSendOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email } = req.body;

  if (!email) {
    res.status(400).json({ error: "Email is required" });
    return;
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      res.status(404).json({ error: "User not found" });
      return;
    }

    const otp = generateOTP();
    const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    await prisma.ucode.upsert({
      where: { email },
      update: { otp, expired_at: expiry },
      create: { email, otp, expired_at: expiry },
    });

    sendForgotPasswordOTP(email, otp);

    res.status(200).json({ success: true, message: "OTP sent successfully" });
  } catch (error) {
    console.error("Error in forgotPasswordSendOtp:", error);
    res
      .status(500)
      .json({ error: "Failed to send OTP. Please try again later." });
  }
};

export const forgotPasswordVerifyOtp = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, otp } = req.body;

  if (!email || !otp) {
    res.status(400).json({ error: "Email and OTP are required" });
    return;
  }

  try {
    const ucode = await prisma.ucode.findUnique({ where: { email } });

    if (!ucode) {
      res.status(400).json({ error: "Please request a new OTP" });
      return;
    }

    if (new Date() > ucode.expired_at) {
      res.status(400).json({ error: "OTP has expired" });
      return;
    }

    if (ucode.otp !== otp) {
      res.status(400).json({ error: "Invalid OTP" });
      return;
    }

    res
      .status(200)
      .json({ success: true, message: "OTP verified successfully" });
  } catch (error) {
    console.error("Error in forgotPasswordVerifyOtp:", error);
    res.status(500).json({ error: "Failed to verify OTP" });
  }
};

export const resetPassword = async (
  req: Request,
  res: Response
): Promise<void> => {
  const { email, password } = req.body;

  if (!email || !password) {
    res.status(400).json({ error: "Email and new password are required" });
    return;
  }

  try {
    const ucode = await prisma.ucode.findUnique({ where: { email } });

    if (!ucode) {
      res.status(400).json({
        error: "OTP verification required before resetting password",
      });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    await prisma.ucode.delete({ where: { email } });

    res
      .status(200)
      .json({ success: true, message: "Password reset successfully" });
  } catch (error) {
    console.error("Error in resetPassword:", error);
    res.status(500).json({ error: "Failed to reset password" });
  }
};

