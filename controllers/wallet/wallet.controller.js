import asyncHandler from "express-async-handler";
import { paystack } from '../../provider/paystack/paystack.js';
import {
  topupWalletService,
  getWalletLedgerService,
} from "./wallet.service.js";

//paystack
export const topupWallet = asyncHandler(async (req, res) => {
  try {
    const { companyId, amount, email, currency } = req.body;

    if (!companyId || !amount || !email) {
      return res.status(400).json({ error: "companyId, amount, and email are required" });
    }

    if (req.user.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can top up the wallet" });
    }
    console.log("Decoded User:", req.user);
    
    if (req.user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ error: "You cannot top up another company's wallet" });
    }

    console.log("Initiating Paystack Transaction for:", { companyId, amount, email, currency });
    const response = await paystack.post("/transaction/initialize", {
      email,
      amount: Math.round(amount * 100),
      currency: currency || "NGN",
      metadata: { companyId: companyId.toString() },
      callback_url: `${process.env.CLIENT_URL}/payment/callback`,
    });
    console.log("Paystack Initialization Response:", response.data);

    return res.status(200).json({
      success: true,
      authorization_url: response.data.data.authorization_url,
      reference: response.data.data.reference,
    });
  } catch (error) {
    console.error("Error in Payment", error.response?.data || error.message);
    res.status(500).json({ error: "Failed to initialize payment" });
  }
});

// export const topupWallet = asyncHandler(async (req, res) => {
//   try {
//     //const userId = req.user.id;
//     const { companyId, amount, currency } = req.body;

//   if (!companyId || !amount) {
//     return res.status(400).json({ error: "companyId and amount are required" });
//   }
//   console.log("Decoded User:", req.user);
      
//     if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
//       return res.status(403).json({ error: "Only admins can top up the wallet" });
//     }
    
//     if (req.user.companyId !== parseInt(companyId)) {
//       return res.status(403).json({ error: "You cannot top up another company's wallet" });
//     }
    

//   const session = await stripe.checkout.sessions.create({
//     payment_method_types: ["card"],
//     line_items: [
//       {
//         price_data: {
//           currency: currency || "usd",
//           product_data: {
//             name: `Wallet Top-up for Company ${companyId}`,
//           },
//           unit_amount: Math.round(amount * 100), // cents
//         },
//         quantity: 1,
//       },
//     ],
//     mode: "payment",
//     success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
//     cancel_url: `${process.env.CLIENT_URL}/cancel`,
//     metadata: { companyId: companyId.toString() },
//   });

//   res.status(200).json({ success: true, sessionId: session.id, url: session.url });
// }
//   catch(error){
//     console.log("Error in Payment",  error.message);
//     res.status(500).json({

//     })
//   }
// });

// //webhook
// export const stripeWebhook = asyncHandler(async (req, res) => {
//   let event;
//   try {
//     const sig = req.headers["stripe-signature"];
//     event = stripe.webhooks.constructEvent(
//       req.body,
//       sig,
//       process.env.STRIPE_WEBHOOK_SECRET
//     );
//   } catch (err) {
//     console.error("Webhook signature verification failed.", err.message);
//     return res.status(400).send(`Webhook Error: ${err.message}`);
//   }

//   // if (event.type === "payment_intent.succeeded") {
//   //   const paymentIntent = event.data.object;
//   //   const companyId = parseInt(paymentIntent.metadata.companyId);
//   //   const amount = paymentIntent.amount_received / 100;
//   //   const currency = paymentIntent.currency;

//   //   await topupWalletService({ companyId, amount, currency });
//   //   console.log(`Wallet credited (PI) for company ${companyId} with ${amount} ${currency}`);
//   // }

//    if (event.type === "checkout.session.completed") {
//     const paymentIntent = event.data.object;
//     const session = event.data.object;
//     const companyId = parseInt(session.metadata.companyId);
//     const amount = session.amount_total / 100;
//     const currency = session.currency;
//     const status = "success";

//   const charge = paymentIntent.charges?.data?.[0];
//   const receipt_url = charge?.receipt_url || null;
//   console.log("receipt", receipt_url);

   
//     await topupWalletService({ companyId, amount, currency, status, receipt_url });
//     console.log(`Wallet credited (CS) for company ${companyId} with ${amount} ${currency}`);
//   }

//   res.json({ received: true });
// });

export const paystackwebhook = asyncHandler(async (req, res) => {
  try {
    const event = JSON.parse(req.body.toString());
    console.log("Paystack Webhook Event:", event);

    if (event.event === "charge.success") {
      const reference = event.data.reference;

      // Verify with Paystack
      const verifyResponse = await paystack.get(`/transaction/verify/${reference}`);
      const verifiedData = verifyResponse.data.data;

      if (verifiedData.status === "success") {
        const companyId = parseInt(verifiedData.metadata?.companyId);
        const amount = verifiedData.amount / 100;
        const currency = verifiedData.currency;
        const status = "success";
        const receipt_url = verifiedData.reference;

        await topupWalletService({ companyId, amount, currency, status, receipt_url });

        console.log(`✅ Wallet credited for company ${companyId} with ${amount} ${currency}`);
      }
    }

    res.sendStatus(200);
  } catch (error) {
    console.error("Webhook Error:", error.message);
    res.status(500).json({ error: "Webhook handling failed" });
  }
});



export const getWalletLedger = asyncHandler(async (req, res) => {
  try {
    const { companyId } = req.query;

    if (!companyId) {
      return res.status(400).json({ error: "companyId is required" });
    }

    const ledger = await getWalletLedgerService(parseInt(companyId));
    res.status(200).json({ success: true, ledger });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch wallet ledger" });
  }
});
