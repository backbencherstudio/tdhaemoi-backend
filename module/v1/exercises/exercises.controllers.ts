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
      if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
      return res.status(400).json({
        success: false,
        message: 'Email and PDF file are required',
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
      return res.status(400).json({
        success: false,
        message: 'Invalid email format',
      });
    }

    if (pdfFile.mimetype !== 'application/pdf') {
      if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed',
      });
    }

    sendPdfToEmail(email, pdfFile);

    // Clean up file after email is sent
    if (pdfFile && fs.existsSync(pdfFile.path)) fs.unlinkSync(pdfFile.path);

    return res.status(200).json({
      success: true,
      message: 'Foot exercise program sent successfully to your email',
    });
  } catch (error: any) {
    if (req.file && fs.existsSync(req.file.path)) fs.unlinkSync(req.file.path);
    console.error('Error in sendExercisesEmail:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Failed to send exercise program email',
    });
  }
};