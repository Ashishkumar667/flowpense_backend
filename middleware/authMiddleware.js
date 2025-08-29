import jwt from 'jsonwebtoken';
import asyncHandler from 'express-async-handler';
import dotenv from 'dotenv';

dotenv.config();

export const protectedRoutes = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      console.log('Token from header:', token);

      const decoded = jwt.verify(token, process.env.JWT_SECRET);


      console.log('Decoded JWT:', decoded);


      req.user = {
        id: decoded.userId,
        email: decoded.email,
      };

      next();
    } catch (error) {
      console.error('Auth Middleware Error:', error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
  }
});
