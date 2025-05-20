import nodemailer from "nodemailer";

import dotenv from "dotenv";
import { emailForgotPasswordOTP } from "../constants/email_message";
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

export const sendForgotPasswordOTP = async (
  userName: string,
  email: string,
  otp: string
): Promise<void> => {
  const htmlContent = emailForgotPasswordOTP(userName, email, otp);
  await sendEmail(email, "otp Code for reset password", htmlContent);
};

export const sendPartnershipWelcomeEmail = async (
  email: string,
  password: string
): Promise<void> => {
  const htmlContent = partnershipWelcomeEmail(email, password);
  await sendEmail(email, "Welcome to TDHaemoi Partnership Program", htmlContent);
};