import { OAuth2Client } from "google-auth-library";
import axios from "axios";
import jwt from "jsonwebtoken";
import prisma from "../../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const generateJwt = (user) =>
  jwt.sign(
    {
      userId: user.id,
      email: user.email,
      name: user.firstName,
      provider: "google",
    },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

export const googleWebSignup = async (req, res) => {
  const { code } = req.body;
  console.log("Received code:", code);

  if (!code) {
    return res.status(400).json({ message: "Authorization code missing" });
  }

  try {
    const params = new URLSearchParams();
    params.append("client_id", process.env.GOOGLE_CLIENT_ID_WEB);
    params.append("client_secret", process.env.GOOGLE_CLIENT_SECRET);
    params.append("redirect_uri", process.env.GOOGLE_REDIRECT_URI);
    params.append("grant_type", "authorization_code");
    params.append("code", code);

    console.log("Exchanging code for tokens...");
    console.log("Token request params:", params.toString());

    const tokenResponse = await axios.post(
      "https://oauth2.googleapis.com/token",
      params.toString(),
      { headers: { "Content-Type": "application/x-www-form-urlencoded" } }
    );

    console.log("Token response data:", tokenResponse.data);

    const { id_token, access_token, refresh_token } = tokenResponse.data;

    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID_WEB,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    
    let user = await prisma.user.findUnique({ where: { email } });
     console.log("User lookup result:", user);
     
    if (!user) {
      console.log(`Creating new Google user: ${email}`);
      const [firstName, ...lastNameParts] = name.split(" ");
      user = await prisma.user.create({
        data: {
          firstName,
          lastName: lastNameParts.join(" ") || "",
          email,
          password: "", 
          isVerified: true,
          mobile: "",
          role: "EMPLOYEE",
          googleId,
          authProvider: "google",
          accessToken: access_token,
          refreshToken: refresh_token,
        },
      });
      console.log(`✅ New Google user created: ${user.email}`);
    } else {
      console.log(`🔑 Existing Google user signed in: ${user.email}`);
    }

    const token = generateJwt(user);

    return res.status(200).json({
      token,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePic: picture || "https://shorturl.at/byGEu",
      },
      access_token,
      refresh_token,
    });
  } catch (error) {
    console.error("❌ Google Authentication Error:", error.message);
    return res.status(401).json({
      message: "Google authentication failed",
      error: error.message,
    });
  }
};
