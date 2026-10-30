import dotenv from 'dotenv';

dotenv.config();

export const config = {
  appUrl: process.env.APP_URL || 'http://localhost:3001',
  bffUrl: process.env.BFF_URL || 'http://localhost:8090',
  claimsUrl: process.env.CLAIMS_URL || 'http://localhost:8080',
  users: {
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@demo.com',
      password: process.env.ADMIN_PASSWORD || 'Admin123!',
      role: 'ADMIN',
    },
    claimant: {
      email: process.env.CLAIMANT_EMAIL || 'claimant@demo.com',
      password: process.env.CLAIMANT_PASSWORD || 'Claimant123!',
      role: 'CLAIMANT',
    },
  },
};
