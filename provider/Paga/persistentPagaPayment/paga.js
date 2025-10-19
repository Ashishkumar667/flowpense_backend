import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const pagaPersistentPayment = axios.create({
  baseURL: process.env.PAGA_PERSISTENT_BASE_URL, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

pagaPersistentPayment.interceptors.request.use(async (config) => {
  const authToken = Buffer.from(
    `${process.env.PAGA_PRINCIPAL}:${process.env.PAGA_CREDENTIALS}`
  ).toString("base64");

  config.headers["Authorization"] = `Basic ${authToken}`;

  const data = config.data || {};

  let concatString = "";
 if (config.url.includes("/registerPersistentPaymentAccount")) {
    concatString =
      (data.referenceNumber) +
      (data.accountReference || "") +
      (data.callbackUrl || "") +
      process.env.PAGA_HMAC_SECRET;
      console.log("Concat String:", concatString);
  } 
  if (concatString) {
    const hash = crypto.createHash("sha512").update(concatString).digest("hex");
    config.headers["hash"] = hash;
    console.log(" Paga Hash:", hash);
  }

  return config;
});