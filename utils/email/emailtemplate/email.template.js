import { sendEmail } from "../email.js";
import asyncHandler from 'express-async-handler';

export const verificationEmailTemplate = asyncHandler(async(email, firstName, otpCode) => {
  const subject = "Email Verification Code - Flowpense";
  const html = `
    <div style="font-family: Arial, sans-serif; line-height: 1.6;">
      <h2 style="color: #333;">Email Verification</h2>
      <p>Dear ${firstName},</p>
      <p>Thank you for registering with Flowpense! Please use the following One-Time Password (OTP) to verify your email address:</p>
      <h3 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${otpCode}</h3>
      <p>This OTP is valid for the next 10 minutes. If you did not request this, please ignore this email.</p>
      <p>Best regards,<br/>The Flowpense Team</p>
    </div>
  `;
  await sendEmail(email, subject, html);
  console.log("Verification email sent to:", email);
});


export const passwordResetEmailTemplate = asyncHandler(async(email, firstName, otp) => {
    const subject = "Password Reset Request - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Password Reset Request</h2>
        <p>Dear ${firstName},</p>
        <p>We received a request to reset your password. Please use this OTP to set new password:</p>
        <h3 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</h3>
        <p>This OTP will expire in 10 MINUTES. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br/>The Flowpense Team</p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Password reset email sent to:", email);
});


export const resetpasswordConfirmationEmailTemplate = asyncHandler(async(email, firstName) => {
    const subject = "Password Successfully Reset - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Password Successfully Reset</h2>
        <p>Dear ${firstName},</p>
        <p>Your password has been successfully reset. If you did not perform this action, please contact our support team immediately.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Password reset confirmation email sent to:", email); 
});

export const loginOtpEmailTemplate = asyncHandler(async(email, firstName, otp) => {
   const subject = "Login OTP - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Login -OTP</h2>
        <p>Dear ${firstName},</p>
        <p>We received a request for login from your account.Please use this <strong>OTP</strong> to login:</p>
        <h3 style="background-color: #f4f4f4; padding: 10px; border-radius: 5px; display: inline-block;">${otp}</h3>
        <p>This OTP will expire in 10 MINUTES. If you did not request a password reset, please ignore this email.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Password reset email sent to:", email);
})