import dotenv from 'dotenv';

dotenv.config();

export const users = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@demo.com',
    password: process.env.ADMIN_PASSWORD || 'Admin123!',
  },
  claimant: {
    email: process.env.CLAIMANT_EMAIL || 'claimant@demo.com',
    password: process.env.CLAIMANT_PASSWORD || 'Claimant123!',
  },
};
