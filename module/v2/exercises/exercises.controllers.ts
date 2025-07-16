import { Request, Response } from "express";
import exercises from "./exercises.data";
import fs from "fs";
import { sendPdfToEmail } from "../../../utils/emailService.utils";

export const getAllexercises = async (req: Request, res: Response) => {
  try {
    res.status(200).json({ success: true, exercises });
  } catch (error) {
    console.error("Error fetching exercises:", error);
    res.status(500).json({
      success: false,
      message: "Server error, could not fetch exercises.",
    });
  }
};



export const sendExercisesEmail = async (req: Request, res: Response) => {
  try {
    const { email } = req.body;
    const pdfFile = req.file;

    if (!email || !pdfFile) {
      if (pdfFile) fs.unlinkSync(pdfFile.path);

      res.status(400).json({
        success: false,
        message: "Email and PDF file are required",
      });
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      fs.unlinkSync(pdfFile.path);
      res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
      return;
    }

    if (pdfFile.mimetype !== "application/pdf") {
      fs.unlinkSync(pdfFile.path);
      res.status(400).json({
        success: false,
        message: "Only PDF files are allowed",
      });
      return;
    }

    // Send email with PDF content
    await sendPdfToEmail(email, pdfFile);

    // Clean up
    fs.unlinkSync(pdfFile.path);

    res.status(200).json({
      success: true,
      message: "Email with PDF content sent successfully",
    });
  } catch (error: any) {
    // Clean up file if error occurs
    if (req.file) fs.unlinkSync(req.file.path);

    res.status(500).json({
      success: false,
      message: error.message || "Failed to send email",
    });
  }
};
