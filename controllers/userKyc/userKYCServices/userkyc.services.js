import prisma from "../../../config/db.js";

export const uploadUserKycService = async ({ userId, country, docs }) => {
  return prisma.userKyc.upsert({
    where: { userId },
    update: {
      country,
      docs,
      status: "pending",
    },
    create: {
      userId,
      country,
      docs,
      status: "pending",
    },
  });
};