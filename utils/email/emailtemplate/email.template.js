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
        <p>This OTP will expire in 10 MINUTES. If you did not request this, please ignore this email.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
   // console.log("confirmation email sent :", email);
})

export const cardCreationEmailTemplate = asyncHandler(async(email, firstName, cardName, cardNumber, cardType) => {  
    const subject = "New Card Created - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">New Card Created</h2>
        <p>Dear ${firstName},</p>
        <p>Your new card has been successfully created. Here are the details of your new card:</p>
        <ul>
          <li><strong>Card Name:</strong> ${cardName}</li>  
          <li><strong>Card Number:</strong> ${cardNumber}</li>
          <li><strong>Card Type:</strong> ${cardType}</li>
        </ul>
        <p>If you did not perform this action, please contact our support team immediately.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Card creation email sent to:", email); 
});

export const cardFundingEmailTemplate = asyncHandler(async(email, firstName, cardName, amountFunded, newBalance) => {  
    const subject = "Card Funded Successfully - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Card Funded Successfully</h2>
        <p>Dear ${firstName},</p>
        <p>Your card has been successfully funded. Here are the details of the transaction:</p>
        <ul>
          <li><strong>Card Name:</strong> ${cardName}</li>
          <li><strong>Amount Funded:</strong> $${amountFunded.toFixed(2)}</li>
          <li><strong>New Balance:</strong> $${newBalance.toFixed(2)}</li>
        </ul> 
        <p>If you did not perform this action, please contact our support team immediately.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Card funding email sent to:", email); 
}
);

export const approvalRequestEmailTemplate = asyncHandler(async(email, firstName, expenseId, amount, merchant) => {  
    const subject = "Expense Approval Request - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Expense Approval Request</h2>
        <p>Dear ${firstName},</p>
        <p>An expense has been submitted that requires your approval. Here are the details of the expense:</p>
        <ul>
          <li><strong>Expense ID:</strong> ${expenseId}</li>
          <li><strong>Amount:</strong> ${Number(amount).toFixed(2)}</li>
          <li><strong>Merchant:</strong> ${merchant}</li>
        </ul>
        <p>Please review and approve or reject the expense at your earliest convenience.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Approval request email sent to:", email); 
});

export const sendexpenseApprovalEmailTemplate = asyncHandler(async(email, firstName,approverName, expenseId, amount, merchant, status) => {  
    const subject = "Expense Approval Status - Flowpense";
    const html = `  
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Expense Approval Status</h2>
        <p>Dear ${firstName},</p>
        <p>Your expense has been reviewed by approver ${approverName}. Here are the details:</p>
        <ul>
          <li><strong>Expense ID:</strong> ${expenseId}</li>
          <li><strong>Amount:</strong> ${amount}</li>
          <li><strong>Merchant:</strong> ${merchant}</li>
          <li><strong>Expense Email:</strong> ${email}</li>
          <li><strong>Status:</strong> ${status}</li>
        </ul>
        <p>If you have any questions, please contact our support team.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;
    await sendEmail(email, subject, html);
    console.log("Expense approval status email sent to:", email); 
}
);

export const sendRequestForCradFunding = asyncHandler(
  async (email, firstName, requesterName, cardId, cardName, cardDepartment) => {
    const subject = "Requesting Card Funding - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">Card Funding Request</h2>
        <p>Dear ${firstName},</p>
        <p><strong>${requesterName}</strong> is requesting funding for a card. Here are the details:</p>
        <ul>
          <li><strong>Card Id:</strong> ${cardId}</li>
          <li><strong>Card Name:</strong> ${cardName}</li>
          <li><strong>Card Department:</strong> ${cardDepartment}</li>
        </ul>
        <p>Please log in to the system to review and approve/reject this request.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;

    await sendEmail(email, subject, html);
    console.log("Card funding request email sent to:", email);
  }
);

export const sendEmailToEmployee = asyncHandler(async(email,fullName, jobTitle,department) => {
   const subject = "Empoyee Added - Flowpense";
    const html = `
      <div style="font-family: Arial, sans-serif; line-height: 1.6;">
        <h2 style="color: #333;">You are added as an employee BY company Admin</h2>
        <p>Dear ${fullName},</p>
        <p><strong>${email}</strong> ,This Email has been added by comapny Admin.</p>
        <ul>
          <li><strong>Job Title:</strong> ${jobTitle}</li>
          <li><strong>Department:</strong> ${department}</li>
        </ul>
        <p>Please register yourself through our app <strong>Flowpense</strong>.</p>
        <p>Best regards,<br/><strong>The Flowpense Team</strong></p>
      </div>
    `;

    await sendEmail(email, subject, html);
    console.log("Employee added email sent to:", email);
})