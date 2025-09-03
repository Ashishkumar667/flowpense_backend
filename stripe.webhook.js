import express from "express";
import { stripeWebhook } from "./controllers/wallet/wallet.controller.js";

const router = express.Router();


router.post(
  "/stripe/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

export default router;
