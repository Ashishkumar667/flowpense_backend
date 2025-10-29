import Tesseract from "tesseract.js";

export async function extractReceiptPdf(imagePath){
    try {
        const { data: { text }} = await Tesseract.recognize(imagePath, "eng");
        console.log("OCR data by extracting pdf receipt", text);

        const merchantMatch = text.match(/(?:Merchant|Store|Vendor)[:\s]*([A-Za-z0-9 &]+)/i);
        const amountMatch = text.match(/(?:Total|Amount|NGN|Naira|₦)\s*([\d,.]+)/i);
        const currencyMatch = text.match(/(NGN|USD|EUR|GBP|₦|\$)/i);

        return {
          merchant: merchantMatch ? merchantMatch[1].trim() : null,
          amount: amountMatch ? parseFloat(amountMatch[1].replace(/,/g, "")) : null,
          currency: currencyMatch ? currencyMatch[1].replace(/₦/, "NGN") : "NGN",
          rawText: text
         };

    } catch (error) {
         console.error("OCR Error:", error);
         throw new Error("issue in extracting pdf", error);
    }
}