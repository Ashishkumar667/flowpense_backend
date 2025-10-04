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
})