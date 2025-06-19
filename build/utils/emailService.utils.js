"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendAdminLoginNotification = exports.sendImprovementEmail = exports.sendNewSuggestionEmail = exports.sendPartnershipWelcomeEmail = exports.sendForgotPasswordOTP = exports.sendEmail = exports.generateOTP = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const dotenv_1 = __importDefault(require("dotenv"));
const email_message_1 = require("../constants/email_message");
const email_message_2 = require("../constants/email_message");
dotenv_1.default.config();
const generateOTP = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
};
exports.generateOTP = generateOTP;
const sendEmail = async (to, subject, htmlContent) => {
    const mailTransporter = nodemailer_1.default.createTransport({
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
exports.sendEmail = sendEmail;
console.log(exports.sendEmail);
const sendForgotPasswordOTP = async (email, otp) => {
    console.log(email, otp);
    const htmlContent = (0, email_message_1.emailForgotPasswordOTP)(email, otp);
    let data = await (0, exports.sendEmail)(email, "OTP Code for Password Reset", htmlContent);
};
exports.sendForgotPasswordOTP = sendForgotPasswordOTP;
const sendPartnershipWelcomeEmail = async (email, password) => {
    const htmlContent = (0, email_message_2.partnershipWelcomeEmail)(email, password);
    await (0, exports.sendEmail)(email, "Welcome to TDHaemoi Partnership Program", htmlContent);
};
exports.sendPartnershipWelcomeEmail = sendPartnershipWelcomeEmail;
const sendNewSuggestionEmail = async (name, email, phone, firma, suggestion) => {
    const htmlContent = (0, email_message_1.newSuggestionEmail)(name, email, phone, firma, suggestion);
    await (0, exports.sendEmail)("anamul36.bdcalling@gmail.com", "New Suggestion Received", htmlContent);
};
exports.sendNewSuggestionEmail = sendNewSuggestionEmail;
const sendImprovementEmail = async (company, phone, reason, message) => {
    const htmlContent = (0, email_message_1.newImprovementEmail)(company, phone, reason, message);
    await (0, exports.sendEmail)("anamul36.bdcalling@gmail.com", "New Improvement Suggestion Received", htmlContent);
};
exports.sendImprovementEmail = sendImprovementEmail;
const sendAdminLoginNotification = async (adminEmail, adminName, ipAddress) => {
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
    const htmlContent = (0, email_message_1.adminLoginNotificationEmail)(adminEmail, adminName, loginDate, loginTime, ipAddress);
    await (0, exports.sendEmail)(adminEmail, "New admin panel login detected", htmlContent);
};
exports.sendAdminLoginNotification = sendAdminLoginNotification;
// DATABASE_URL="postgresql://postgres:FO2209BDC4188@localhost:5432/td_db?schema=public"
// APP_URL="https://td.signalsmind.com"
// FRONTEND_URL="http://192.168.4.3:3001"
// JWT_SECRET=D7FG3J3hhh
// PORT=8001
// NODE_MAILER_USER=tqmhosain@gmail.com
// NODE_MAILER_PASSWORD=qzao cpjt pitk iaxm
//# sourceMappingURL=emailService.utils.js.map