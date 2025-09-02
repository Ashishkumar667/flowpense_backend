import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import prisma from '../../../config/db.js';
import asyncHandler from 'express-async-handler';


export const generate2FaSecret = asyncHandler(async(req, res) => {
 try {
    //    const { userId } = req.body;
         const userId = req.user.id;
   
       const user = await prisma.user.findUnique({
           where: { id : userId}
       });
   
       if(!user){
           return res.status(404).json({ message: 'User not found' });
       }
   
       const secret = speakeasy.generateSecret({
           name: `Flowpense (${user.email})`,
           length: 20
       });
   
       await prisma.user.update({
           where: { id: userId },
           data:{
               mfaSecret: secret.base32
           }
       });
   
   
       const otpauthurl = speakeasy.otpauthURL({
           secret: secret.ascii,
           label: `Flowpense (${user.email})`,
           issuer: 'Flowpense'
       });
   
       QRCode.toDataURL(otpauthurl, (err, data_url) => {
           if (err) {
               return res.status(500).json({ message: 'Error generating QR code' });
           }
           res.status(200).json({
               message: '2FA secret generated successfully',
               secret: secret.base32,
               otpauthurl: otpauthurl,
               qrCodeUrl: data_url
           });
       });
 } catch (error) {
        console.error('Error in ENbaling 2FA :', error);
        res.status(500).json({ message: 'Internal server error' , error: error.message});
 }

});