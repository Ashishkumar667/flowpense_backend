import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

export const generateTokens = (user) => {
  const accessToken = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      companyId: user.companyId,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1h" } 
  );

  const refreshToken = jwt.sign(
    { userId: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: "20d" }
  );

  return { accessToken, refreshToken };
};
