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


export const uploadCompanyKycService = asyncHandler(async( companyId, docs, adminBvn ) => {
    const hashedBvn = await bcrypt.hash(adminBvn, 10);

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