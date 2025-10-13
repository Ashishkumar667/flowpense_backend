// import nodemailer from "nodemailer";
// import dotenv from "dotenv";
// dotenv.config();

// export const sendEmail = async (to, subject, html) => {
//   const transporter = nodemailer.createTransport({
//       // host:"smtp.gmail.com",
//       // port:587,
//       // secure: false,
//       service: 'gmail',
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

// import nodemailer from "nodemailer";
// import { google } from "googleapis";
// import dotenv from "dotenv";

// dotenv.config();

// const oAuth2Client = new google.auth.OAuth2(
//   process.env.GMAIL_CLIENT_ID,
//   process.env.GMAIL_CLIENT_SECRET,
//   process.env.GMAIL_REDIRECT_URI
// );

// oAuth2Client.setCredentials({
//   refresh_token: process.env.GMAIL_REFRESH_TOKEN,
// });

// export const sendEmail = async (to, subject, html) => {
//   try {
    
//     const accessToken = await oAuth2Client.getAccessToken();
//     console.log("Access Token:", accessToken.token);

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       auth: {
//         type: "OAuth2",
//         user: process.env.EMAIL_USER,
//         clientId: process.env.GMAIL_CLIENT_ID,
//         clientSecret: process.env.GMAIL_CLIENT_SECRET,
//         refreshToken: process.env.GMAIL_REFRESH_TOKEN,
//         accessToken: accessToken.token,
//       },
//     });

//     const mailOptions = {
//       from: `"Flowpense" <${process.env.EMAIL_USER}>`,
//       to,
//       subject,
//       html,
//     };

//     const result = await transporter.sendMail(mailOptions);
//     console.log("✅ Email sent:", result.messageId);
//     return result;
//   } catch (error) {
//     console.error("❌ Email sending error:", error);
//     throw new Error("Failed to send email");
//   }
// };


// import sgMail from "@sendgrid/mail";

// sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// export const sendEmail = async(to,subject, html) => {
//     try {
//       const result = await sgMail.send({
//              to,
//              from:  `"Flowpense" <${process.env.EMAIL_USER}>`,
//              subject,
//              html,
//      });

//      console.log("result of email", result);
//      return result;
//     } catch (error) {
//     console.error("❌ sendGrid email sending error:", error.message);
//     throw new Error("Failed to send email");
//   }
// };

import formData from "form-data";
import Mailgun from "mailgun.js";
import dotenv from "dotenv";

dotenv.config();

const mailgun = new Mailgun(formData);
const mg = mailgun.client({
  username: "api",
  key: process.env.MAILGUN_API_KEY, // from Mailgun dashboard
});

export const sendEmail = async (to, subject, html) => {
  try {
    const domain = process.env.MAILGUN_DOMAIN; // e.g., sandboxXXXX.mailgun.org

    const result = await mg.messages.create(domain, {
      from: `"Flowpense" <no-reply@${domain}>`,
      to,
      subject,
      html,
    });

    console.log("✅ Email sent via Mailgun:", result.id);
    return result;
  } catch (error) {
    console.error("❌ Mailgun email sending error:", error.message);
    throw new Error("Failed to send email");
  }
};
