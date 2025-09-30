// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const sendEmail = async (to, subject, html) => {
//   const transporter = nodemailer.createTransport({
//       host: process.env.SMTP_HOST,
//       port: parseInt(process.env.SMTP_PORT || '587', 10),
//       secure: false,
//     auth: {
//       user: process.env.EMAIL_USER,
//       pass: process.env.EMAIL_PASS,
//     },
//   });

//   await transporter.sendMail({
//     from: `"Flowpense" <${process.env.EMAIL_USER}>`,
//     to,
//     subject,
//     html,
//   });
// };

import nodemailer from "nodemailer";
import { google } from 'googleapis';
import dotenv from "dotenv";

dotenv.config();

const oAuth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI 
);

oAuth2Client.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });
const accessToken = await oAuth2Client.getAccessToken();

export const sendEmail = async (to, subject, html) => {
  try {
      
    const transporter = nodemailer.createTransport({
        // host: "smtp.gmail.com",
        // port: 465,
        //  secure: true,
         service:"gmail",
       auth: {
        type: "OAuth2",
        user: process.env.EMAIL_USER, 
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken.token,
      },
    });

    console.log("transporter",transporter);
    const mailOptions = {
      from: `"Flowpense" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    };
    console.log("mailoptions", mailOptions);
    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", result.messageId);

    return result;
  } catch (error) {
    console.error("❌ Email sending error:", error);
    throw new Error("Failed to send email");
  }
};

// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// await sgMail.send({
//   to,
//   from:  `"Flowpense" <${process.env.EMAIL_USER}>`,
//   subject,
//   html,
// });
