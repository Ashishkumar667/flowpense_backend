import prisma from '../../config/db.js';
import asyncHandler from 'express-async-handler';

export const SendingNotification = asyncHandler(async(userId, message) => {
    try {
        if (!userId) {
           console.error(" Missing userId in SendingNotification");
           return null;
        }

        await prisma.notification.create({
            data: {
                userId,
                message,
                read: false
            }
        });

        const user = await prisma.user.findUnique({
            where: { id: userId },
            //select: { notifications: true }
        });

          if(!user){
          console.warn(`Notification: User ${userId} not found`);
          return;
     }

     

    } catch (error) {
        console.error("Error sending notification:", error);
        res.status(500).json({ message: "Failed to send notification" , error: error.message});
    }
})