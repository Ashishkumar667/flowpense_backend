import speakeasy from 'speakeasy';
import prisma from '../../../config/db.js';
import asyncHandler from 'express-async-handler';

export const verify2FA = asyncHandler(async( req, res) => {
    try {
        const userId = req.user.id;
        const { token } = req.body;
    
        const user = await prisma.user.findUnique({
            where:{ id: userId }
        })
    
        if(!user || !user.mfaSecret){
            return res.status(404).json({ message: 'User not found or 2FA not enabled' });
        }
    
        const verified = speakeasy.totp.verify({
            secret: user.mfaSecret,
            encoding: 'base32',
            token: token,
            window: 1
        });
    
        if(verified){
            await prisma.user.update({
                where: { id: userId },
                data: { 
                    mfaEnabled: true 
                }
            });
            return res.status(200).json({ message: '2FA verified successfully' });
        }
    } catch (error) {
        console.error('2FA Verification Error:', error);
        res.status(500).json({ message: 'Internal server error' , error: error.message});
    }
})