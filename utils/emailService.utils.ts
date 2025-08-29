import nodemailer from "nodemailer";
import fs from "fs";

import dotenv from "dotenv";
import {
  adminLoginNotificationEmail,
  emailForgotPasswordOTP,
  newSuggestionEmail,
  newImprovementEmail,
  sendPdfToEmailTamplate,
  excerciseEmail,
  invoiceEmailTemplate,
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


export const sendPdfToEmail = async (email: string, pdf: any): Promise<void> => {
  try {
    const { size } = fs.statSync(pdf.path);
    if (size > 20 * 1024 * 1024) {
      throw new Error('Invoice PDF is too large to email (>20MB).');
    }

    const pdfBuffer = fs.readFileSync(pdf.path);

    const htmlContent = sendPdfToEmailTamplate(pdf);

    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAILER_USER || '',
        pass: process.env.NODE_MAILER_PASSWORD || '',
      },
      connectionTimeout: 10000,
      greetingTimeout: 10000,
      socketTimeout: 15000,
    });

    const mailOptions = {
      from: `"TDHaemoi" <${process.env.NODE_MAILER_USER}>`,
      to: email,
      subject: 'Your Invoice',
      html: htmlContent,
      attachments: [
        {
          filename: pdf.originalname || 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    };

    await mailTransporter.sendMail(mailOptions);

    console.log('Email with PDF sent successfully.');
  } catch (error) {
    console.error('Error in sendPdfToEmail:', error);
    throw new Error('Failed to send PDF email.');
  }
};

export const sendInvoiceEmail = async (
  toEmail: string,
  pdf: any,
  options?: { customerName?: string; total?: number }
): Promise<void> => {
  try {
    const { size } = fs.statSync(pdf.path);
    if (size > 20 * 1024 * 1024) {
      throw new Error('Invoice PDF is too large to email (>20MB).');
    }

    const pdfBuffer = fs.readFileSync(pdf.path);

    const htmlContent = invoiceEmailTemplate(
      options?.customerName || 'Customer',
      options?.total
    );

    const mailTransporter = nodemailer.createTransport({
      service: 'gmail',
      port: 587,
      secure: false,
      auth: {
        user: process.env.NODE_MAILER_USER || '',
        pass: process.env.NODE_MAILER_PASSWORD || '',
      },
      // connectionTimeout: 10000,
      // greetingTimeout: 10000,
      // socketTimeout: 15000,
    });

    const mailOptions = {
      from: `"TDHaemoi" <${process.env.NODE_MAILER_USER}>`,
      to: toEmail,
      subject: 'Your TDHaemoi Invoice',
      html: htmlContent,
      attachments: [
        {
          filename: pdf.originalname || 'invoice.pdf',
          content: pdfBuffer,
          contentType: 'application/pdf',
        },
      ],
    } as any;

    await mailTransporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Error in sendInvoiceEmail:', error);
    throw new Error('Failed to send invoice email.');
  }
};
