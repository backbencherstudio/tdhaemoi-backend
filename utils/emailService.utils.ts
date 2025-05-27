import nodemailer from "nodemailer";

import dotenv from "dotenv";
import { adminLoginNotificationEmail, emailForgotPasswordOTP, newSuggestionEmail } from "../constants/email_message";
import { partnershipWelcomeEmail } from "../constants/email_message";

dotenv.config();

export const generateOTP = (): string => {
  return Math.floor(1000 + Math.random() * 9000).toString();
};

const sendEmail = async (
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

export const sendForgotPasswordOTP = async (email: string, otp: string): Promise<void> => {
  console.log(email, otp)
  const htmlContent = emailForgotPasswordOTP(email, otp);
  await sendEmail(email, "OTP Code for Password Reset", htmlContent);
};

export const sendPartnershipWelcomeEmail = async (
  email: string,
  password: string
): Promise<void> => {
  const htmlContent = partnershipWelcomeEmail(email, password);
  await sendEmail(email, "Welcome to TDHaemoi Partnership Program", htmlContent);
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
    "wefind.dz@gmail.com",
    "New Suggestion Received",
    htmlContent
  );
};



export const sendAdminLoginNotification = async (
  adminEmail: string,
  adminName: string,
  ipAddress: string,
): Promise<void> => {
  const now = new Date();

  const loginDate = now.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const loginTime = now.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric',
    hour12: true,
  });

  const htmlContent = adminLoginNotificationEmail(
    adminEmail,
    adminName,
    loginDate,
    loginTime,
    ipAddress,
  );

  await sendEmail(
    adminEmail,
    "New admin panel login detected",
    htmlContent
  );
};


