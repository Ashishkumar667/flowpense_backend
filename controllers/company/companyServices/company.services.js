import prisma from '../../../config/db.js';
import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';

export const registerCompanyService = asyncHandler(async({ name, rcNumber, tin, country, adminUserId }) => {
    return prisma.company.create({
    data: {
      name,
      rcNumber,
      tin,
      country,
      users: { connect: { id: adminUserId } },
    },
  });
});


export const uploadCompanyKycService = asyncHandler(async({ companyId, docs, adminBvn }) => {
   console.log(companyId, docs, adminBvn);

  if (!adminBvn || typeof adminBvn !== 'string' || adminBvn.length === 0) {
    throw new Error("Admin BVN is required and must be a valid string.");
  } 

    const hashedBvn = await bcrypt.hash(adminBvn, 10);
    console.log("hashedBvn", hashedBvn);

  return prisma.companyKyc.upsert({
    where: { companyId },
    update: {
      docs,
      adminBvnHash: hashedBvn,
      status: "submitted",
    },
    create: {
      companyId,
      docs,
      adminBvnHash: hashedBvn,
      status: "submitted",
    },
  });
});