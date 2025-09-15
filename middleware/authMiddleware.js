import jwt from "jsonwebtoken";
import asyncHandler from "express-async-handler";
import dotenv from "dotenv";
import prisma from "../config/db.js"; 

dotenv.config();

export const protectedRoutes = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];
      console.log("Token from header:", token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      console.log("Decoded JWT:", decoded);

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      req.user = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        companyId: decoded.companyId,
        mfaEnabled: user.mfaEnabled, 
      };

      const allowedWithoutMfa = [
        "/generate-secret",
        "/verify",
        "/logout",
        "/refreshToken",
        "/resend-emailVerif/otp",
        "/verify-email",
        "/reset-password",
        "/forgot-password",
        "/verify/forgot-pass-otp",
      ];

      const isAllowed = allowedWithoutMfa.some((p) =>
        req.path.startsWith(p)
      );
      console.log("MFA Enabled:", user.mfaEnabled, "Is Allowed:", isAllowed);
      console.log("Request Path:", req.path);

      if (!user.mfaEnabled && !isAllowed) {
        return res.status(403).json({
          message: "MFA must be enabled before accessing this resource",
        });
      }

      return next();
          
    } catch (error) {
      console.error("Auth Middleware Error:", error);
       return res
         .status(401)
         .json({ message: "Not authorized, token failed, please refresh" });
    }
  }
  if (!token) {
    return res
      .status(401)
      .json({ message: "Not authorized, no token provided" });
  }
});
