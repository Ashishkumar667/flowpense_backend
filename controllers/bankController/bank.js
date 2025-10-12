import { paystack } from '../../provider/paystack/paystack.js';
import asyncHandler from 'express-async-handler';   

export const getBank = asyncHandler(async(req,res) => {
    try {
        console.log("Getting bank details from paystack....")
        const bankResponse = await paystack.get(`/bank`);

        const response = bankResponse.data;
        console.log("Response", response);

        res.status(200).json({
            message:"Bank fetched successfully",
            response
        })
    } catch (error) {
        console.log("Error in getting Bank", error.message)
        res.status(500).json({
            message:"Error in fetching bank details",
            error: error.message
        });
    };
});

export const addBank = asyncHandler(async(req,res) => {
    try {
        const userId = req.user.id;
        const { AccountNumber, BankCode, country } = req.body;

        if(!AccountNumber || !BankCode || !country){
            return res.status(400).json({
                message:"All fields are required"
            });
        }

        const user = await prisma.user.findUnique({
            where: { id: userId }
        });

        if(!user){
            return res.status(404).json({
                message:"User not found"
            });
        }

        const bank = await prisma.bank.create({
            data:{
                userId: user.id,
                AccountNumber,
                BankCode,
                country
            }
        });
        res.status(200).json({
            message:"Bank added successfully",
            bank
        });

        
    } catch (error) {
        console.log("Error in adding Bank", error.message);
        res.status(500).json({
            message:"Error in adding bank",
            error: error.message
        });
    }
});


export const getUserBank = asyncHandler(async(req,res) => {
    try {
        const userId = req.user.id;
        const bank = await prisma.bank.findMany({
            where: { userId }
        });

        if(!bank || bank.length === 0){
            return res.status(404).json({
                message:"No bank found for this user"
            });
        }

        res.status(200).json({
            message:"Bank fetched successfully",
            bank
        });

    } catch (error) {
        console.log("Error in getting user bank", error.message);
        res.status(500).json({
            message:"Error in fetching user bank",
            error: error.message
        });
    }
});