import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const androidClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const iosClient = new OAuth2Client(process.env.IOS_GOOGLE_CLIENT_ID);

const generateJwt = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.firstName,
      provider: "google",
      role:user.role
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const googleMobileLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is missing" });
  }

  try {
    const ticket = await androidClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Token audience:", payload.aud);
    const { email, name, picture, sub: googleId } = payload;
    


    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const [firstName, ...lastNameParts] = name.split(" ");
      user = await prisma.user.create({
        data: {
          firstName,
          lastName: lastNameParts.join(" ") || "",
          email,
          password: "", 
          isVerified: true,
          mobile: "", 
          role: role ||"EMPLOYEE",
        },
      });
    }

    const token = generateJwt(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.companyId,
        profilePic: picture,
        role: user.role 
      },
    });
  } catch (error) {
    console.error("Error verifying Android ID token:", error.message);
    return res.status(401).json({
      message: "Invalid ID token",
      error: error.message,
    });
  }
};

export const googleIOSMobileLogin = async (req, res) => {
  const { idToken, role } = req.body;

  if (!idToken) {
    return res.status(400).json({ message: "ID token is missing" });
  }

  try {
    const ticket = await iosClient.verifyIdToken({
      idToken,
      audience: process.env.IOS_GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      const [firstName, ...lastNameParts] = name.split(" ");
      user = await prisma.user.create({
        data: {
          firstName,
          lastName: lastNameParts.join(" ") || "",
          email,
          password: "",
          isVerified: true,
          mobile: "",
          role: role || "EMPLOYEE",
        },
      });
    }

    const token = generateJwt(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        company: user.companyId,
        profilePic: picture,
        role: role 
      },
    });
  } catch (error) {
    console.error("Error verifying iOS ID token:", error.message);
    return res.status(401).json({
      message: "Invalid ID token",
      error: error.message,
    });
  }
};
