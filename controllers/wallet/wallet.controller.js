import asyncHandler from "express-async-handler";
import { stripe } from '../../provider/stripe/stripe.js';
import {
  topupWalletService,
  getWalletLedgerService,
} from "./wallet.service.js";


export const topupWallet = asyncHandler(async (req, res) => {
  try {
    const { companyId, amount, currency } = req.body;

  if (!companyId || !amount) {
    return res.status(400).json({ error: "companyId and amount are required" });
  }

      
    if (req.user.role !== "ADMIN" && req.user.role !== "SUPERADMIN") {
      return res.status(403).json({ error: "Only admins can top up the wallet" });
    }

    
    if (req.user.companyId !== parseInt(companyId)) {
      return res.status(403).json({ error: "You cannot top up another company's wallet" });
    }

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    line_items: [
      {
        price_data: {
          currency: currency || "usd",
          product_data: {
            name: `Wallet Top-up for Company ${companyId}`,
          },
          unit_amount: Math.round(amount * 100), // cents
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.CLIENT_URL}/cancel`,
    metadata: { companyId: companyId.toString() },
  });

  res.status(200).json({ success: true, sessionId: session.id, url: session.url });
}
  catch(error){
    console.log("Error in Payment",  error.message);
    res.status(500).json({

    })
  }
});

//webhook
export const stripeWebhook = asyncHandler(async (req, res) => {
  let event;
  try {
    const sig = req.headers["stripe-signature"];
    event = stripe.webhooks.constructEvent(
      req.rawBody, 
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error("Webhook signature verification failed.", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  if (event.type === "payment_intent.succeeded") {
    const paymentIntent = event.data.object;
    const companyId = parseInt(paymentIntent.metadata.companyId);
    const amount = paymentIntent.amount_received / 100;
    const currency = paymentIntent.currency;

    await topupWalletService({ companyId, amount, currency });
    console.log(`Wallet credited for company ${companyId} with ${amount} ${currency}`);
  }

  res.json({ received: true });
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
