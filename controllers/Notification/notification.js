import prisma from "../../config/db.js";
import asyncHandler from "express-async-handler";

export const getNotification = asyncHandler(async(req, res) => {
    const userId = req.user.id;
    const notification = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
    });
        if (!notification) {
        return res.status(404).json({ message: "No notifications found" });
    }
    res.status(200).json({notification});
});
 
export const markedNotification = asyncHandler(async(req, res) => {
    const { id } = req.query; 
    const notification = await prisma.notification.findUnique({
        where:{ id: id},
        data:{
            read: true
        }
        
    });

    console.log("notification", notification);
    if (!notification) {
        return res.status(404).json({ message: "Notification not found" });
    }
    res.status(200).json({ message: "Marked as read" });
})