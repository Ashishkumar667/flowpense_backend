import asyncHandler from "express-async-handler";
import { uploadUserKycService } from "./userKYCServices/userkyc.services.js";

export const uploadUserKyc = asyncHandler(async (req, res) => {
  try {
    const userId = req.user.id;
    const { country } = req.body;
    const files = req.files;

    if (!userId || !files?.length || !country) {
      return res.status(400).json({ error: "Missing KYC fields" });
    }

    const docs = files.map((file) => ({
      filename: file.originalname,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    }));

    const kyc = await uploadUserKycService({
      userId,
      country,
      docs,
    });

    res.status(200).json({ success: true, kyc });
  } catch (err) {
    console.error("Error uploading User KYC:", err);
    res.status(500).json({ error: "Failed to upload user KYC" });
  }
});