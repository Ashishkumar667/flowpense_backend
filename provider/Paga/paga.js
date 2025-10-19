import axios from "axios";
import dotenv from "dotenv";
import crypto from "crypto";

dotenv.config();

export const paga = axios.create({
  baseURL: process.env.PAGA_BASE_URL, 
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

paga.interceptors.request.use(async (config) => {
  const data = config.data || {};

  config.headers["principal"] = process.env.PAGA_PRINCIPAL;
  config.headers["credentials"] = process.env.PAGA_CREDENTIALS;
  config.headers["Content-Type"] = "application/json";

  let concatString = "";
  if (config.url.includes("/depositToBank")) {
    concatString =
      (data.referenceNumber) +
      (data.amount) +
      (data.destinationBankUUID || "") +
      (data.destinationBankAccountNumber || "") +
      process.env.PAGA_HMAC_SECRET;
  } else if (config.url.includes("/getBanks")) {
    concatString =
      (data.referenceNumber) +
      process.env.PAGA_HMAC_SECRET;
    console.log("Concat String for Get Banks:", concatString);
  }

  if (concatString) {
    const hash = crypto.createHash("sha512").update(concatString).digest("hex");
    config.headers["hash"] = hash;
    console.log("🔐 Paga Hash:", hash);
  }

  return config;
});