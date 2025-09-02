import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import prisma from '../../config/db.js';
import { validatePassword } from '../../utils/validate.js';
import dotenv from 'dotenv';
import asyncHandler from 'express-async-handler';
import { 
    verificationEmailTemplate, 
    passwordResetEmailTemplate,
    resetpasswordConfirmationEmailTemplate
} from '../../utils/email/emailtemplate/email.template.js';
dotenv.config();

export const registerUser = asyncHandler(async (req, res) => {
   try {
     const { firstName, lastName, email, password, confirmPassword, mobileNumber, role } = req.body;
 
     if(!firstName || !email || !password || !confirmPassword || !mobileNumber || !role){
         return res.status(400).json({ message: "All fields are required" });
     } 

        if (password !== confirmPassword) {
            return res.status(400).json({ message: "Passwords do not match" });
        }


        if (!validatePassword(password)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number" });
        }

     const existingUser = await prisma.user.findUnique({ where: { email } });

     if (existingUser) {
         return res.status(400).json({ message: "User already exists" });
     }

     const hashedPassword = await bcrypt.hash(password, 10);

     const newUser = await prisma.user.create({
        data: {
            firstName,
            lastName,
            email,
            password:hashedPassword,
            mobile : mobileNumber,
            role: role,
            isVerified: false,
        }
        
     });
    

     const token = jwt.sign({ 
        userId: newUser.id,
        email: newUser.email,
        role: newUser.role,
     }, process.env.JWT_SECRET, { expiresIn: '1h'}
     );

    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();  //valid for 10 minutes
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes from now

    await prisma.otp.create({
        data: {
            userId: newUser.id,
            code: otpCode,
            expiresAt: otpExpiry,
        }
    });

    await verificationEmailTemplate(email, firstName, otpCode);
    console.log("EMail sent to:", email);



      res.status(201)
      .json({
        message: "User created successfully.We have sent an email verification code to youe email.Please verify your email to login",
        user:newUser,
        Token: token
      })
   } catch (error) {
        console.error("Error in registerUser:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
   }
})


export const verifyEmail = asyncHandler(async(req, res) => {
    try {
        const userId = req.user.id;
        const { otpCode } = req.body;
        const record = await prisma.otp.findFirst({
            where: {
                userId,
                code: otpCode,
                expiresAt: {
                    gt: new Date()
                }
            }
        });
        if(!record){
            return res.status(400).json({ message: "Invalid or expired OTP code" });
        }
        await prisma.user.update({
            where: { id: userId },
            data: { isVerified: true }  
        });
        await prisma.otp.delete({
            where: { userId }
        });

        const token = jwt.sign({
                    userId: newUser.id,
                    email: newUser.email,
                    role: newUser.role,
             }, process.env.JWT_SECRET, { expiresIn: '1h'}
        )
        res.status(200).json({ 
            message: "Email verified successfully.Now, please verify 2FA then You can now login to your account",
            Token: token

        });   
    } catch (error) {
        console.error("Error in Email verification:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
});


export const loginUser = asyncHandler(async(req, res) => {
    try {
        const { email, password } = req.body;

        if(!email || !password){
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await prisma.user.findUnique({ where: { email } });

        if(!user){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        if(!user.isVerified){
            return res.status(400).json({ message: "Please verify your email to login" });
        }

        if(!user.mfaEnabled){
            return res.status(400).json({ message: "Please enable and verify 2FA to login" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);

        if(!isPasswordValid){
            return res.status(400).json({ message: "Invalid email or password" });
        }

        const token = jwt.sign({ 
            userId: user.id,
            email: user.email,
            role: user.role,
         }, process.env.JWT_SECRET, { expiresIn: '7d'}
         );

        res.status(200).json({ 
            message: "Login successful",
            user:{
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                mobile: user.mobile,
                role: user.role,
                isVerified: user.isVerified,
                createdAt: user.createdAt,
            },
            Token: token
         });

    } catch (error) {
        console.error("Error in Login:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
});

export const getUserProfile = asyncHandler(async(req, res) => {
    try {
        
        const userId = req.user.id;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  mobile: true,
                  role: true,
                  isVerified: true,
                  mfaEnabled: true,
                  createdAt: true, 
            
            }
        });

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({ 
            user 
        });

    } catch (error) {
        console.error("Error in fetching user profile:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
});


export const forgotPass = asyncHandler(async(req, res) => {
    try {
        
        const { email } = req.body;

        if(!email){
            return res.status(400).json({ message: "Email is required" });
        }

        const user = await prisma.user.findUnique({
            where: { email: email },
            select: { 
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  mobile: true,
                  isVerified: true,
                  createdAt: true, 
            
            }
        });

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString(); 
        const otpExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

        await prisma.otp.upsert({
            where: { userId: user.id },
            update: { code: otp, expiresAt: otpExpiry },
            create: { userId: user.id, code: otp, expiresAt: otpExpiry }
        }); 
        await passwordResetEmailTemplate(email, user.firstName, otp);
        console.log("Password reset email sent to:", email);

        const token = jwt.sign({
            userId: user.id,
            email: user.email,
        }, process.env.JWT_SECRET, 
        { expiresIn: '1h'}
        
    );

        res.status(200).json({ 
            message: "We have sent a password reset OTP to your email. Please check your inbox." 
            ,Token: token
        });

    } catch (error) {
        console.error("Error in forgetting password:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
});

export const verifyForgotPassOtp = asyncHandler(async(req, res) => {
    try {
        
        const userId = req.user.id;
        const { otpCode } = req.body;

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: { 
                  id: true,
                  firstName: true,
                  lastName: true,
                  email: true,
                  mobile: true,
                  role: true,
                  isVerified: true,
                  createdAt: true, 
            
            }
        });  


        const record = await prisma.otp.findFirst({
            where: {
                userId,
                code : otpCode,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if(!record){
            return res.status(400).json({ message: "Invalid or expired OTP code" });
        }


        await prisma.otp.delete({
            where: { userId }
        });


         const token = jwt.sign({
            userId: user.id,
            email: user.email,
            role: user.role,
        }, process.env.JWT_SECRET, 
        { expiresIn: '1h'}
        
      );

        res.status(200).json({ 
            message: "OTP verified successfully.You can now reset your password",
            Token: token
        });

    } catch (error) {
        console.error("Error in verifying forgot password:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
});


export const resetPassword = asyncHandler(async(req, res) => {
    try {
        
        const userId = req.user.id;
        const { newPassword, confirmNewPassword } = req.body;
        if(!newPassword || !confirmNewPassword){
            return res.status(400).json({ message: "All fields are required" });
        }

        if (newPassword !== confirmNewPassword) {
            return res.status(400).json({ message: "Passwords do not match" });

        }


        const user = await prisma.user.findUnique({
            where: { id: userId },
          
        }); 

        if(!user){
            return res.status(404).json({ message: "User not found" });
        }
        console.log("User found:", user);
        if (!validatePassword(newPassword)) {
            return res.status(400).json({ message: "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, and one number" });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword }  
        });

        await resetpasswordConfirmationEmailTemplate(user.email, user.firstName);

        console.log("Password reset confirmation email sent to:", req.user.email);

        res.status(200).json({
            message: "Password reset successfully.You can now login with your new password"
        });

    } catch (error) {
        console.error("Error in resetting password:", error);
        return res.status(500).json({ message: "Internal Server error", error: error.message });
    }
})