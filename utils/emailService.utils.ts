import nodemailer from "nodemailer";
import fs from "fs";

import dotenv from "dotenv";
import {
  adminLoginNotificationEmail,
  emailForgotPasswordOTP,
  newSuggestionEmail,
  newImprovementEmail,
  sendPdfToEmailTamplate,
} from "../constants/email_message";
import { partnershipWelcomeEmail } from "../constants/email_message";

dotenv.config();

export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

export const sendEmail = async (
  to: string,
  subject: string,
  htmlContent: string
): Promise<void> => {
  const mailTransporter = nodemailer.createTransport({
    service: "gmail",
    port: 587,
    auth: {
      user: process.env.NODE_MAILER_USER || "",
      pass: process.env.NODE_MAILER_PASSWORD || "",
    },
  });

  const mailOptions = {
    from: `"TDHaemoi" <tqmhosain@gmail.com>`,
    to,
    subject,
    html: htmlContent,
  };

  await mailTransporter.sendMail(mailOptions);
};
console.log(sendEmail);
//--------------------------------------------------
export const sendForgotPasswordOTP = async (
  email: string,
  otp: string
): Promise<void> => {
  const htmlContent = emailForgotPasswordOTP(email, otp);
  await sendEmail(email, "OTP Code for Password Reset", htmlContent);
};

export const sendPartnershipWelcomeEmail = async (
  email: string,
  password: string
): Promise<void> => {
  const htmlContent = partnershipWelcomeEmail(email, password);
  await sendEmail(
    email,
    "Welcome to TDHaemoi Partnership Program",
    htmlContent
  );
};

export const sendNewSuggestionEmail = async (
  name: string,
  email: string,
  phone: string,
  firma: string,
  suggestion: string
): Promise<void> => {
  const htmlContent = newSuggestionEmail(name, email, phone, firma, suggestion);
  await sendEmail(
    "anamul36.bdcalling@gmail.com",
    "New Suggestion Received",
    htmlContent
  );
};

export const sendImprovementEmail = async (
  company: string,
  phone: string,
  reason: string,
  message: string
): Promise<void> => {
  const htmlContent = newImprovementEmail(company, phone, reason, message);
  await sendEmail(
    "anamul36.bdcalling@gmail.com",
    "New Improvement Suggestion Received",
    htmlContent
  );
};

export const sendAdminLoginNotification = async (
  adminEmail: string,
  adminName: string,
  ipAddress: string
): Promise<void> => {
  const now = new Date();

  const loginDate = now.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const loginTime = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "numeric",
    second: "numeric",
    hour12: true,
  });

  const htmlContent = adminLoginNotificationEmail(
    adminEmail,
    adminName,
    loginDate,
    loginTime,
    ipAddress
  );

  await sendEmail(adminEmail, "New admin panel login detected", htmlContent);
};

export const sendPdfToEmail = async (
  email: string,
  pdf: any,
): Promise<void> => {
  // Read PDF content
  const pdfBuffer = fs.readFileSync(pdf.path);
  const pdfParse = require('pdf-parse');
  
  // Extract text content from PDF
  const data = await pdfParse(pdfBuffer);
  
  // Create HTML content from PDF text
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { 
          font-family: Arial, sans-serif;
          line-height: 1.6;
          margin: 40px;
        }
        pre {
          white-space: pre-wrap;
          word-wrap: break-word;
        }
      </style>
    </head>
    <body>
      <h2>Exercise Program</h2>
      <pre>${data.text}</pre>
    </body>
    </html>
  `;

  await sendEmail(
    email,
    "Exercise directions",
    htmlContent
  );
};




// DATABASE_URL="postgresql://postgres:FO2209BDC4188@localhost:5432/td_db?schema=public"
// APP_URL="https://td.signalsmind.com"
// FRONTEND_URL="http://192.168.4.3:3001"
// JWT_SECRET=D7FG3J3hhh
// PORT=8001
// NODE_MAILER_USER=tqmhosain@gmail.com
// NODE_MAILER_PASSWORD=qzao cpjt pitk iaxm
