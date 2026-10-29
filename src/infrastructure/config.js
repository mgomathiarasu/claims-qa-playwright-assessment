import dotenv from 'dotenv';

dotenv.config();

export const config = {
  appUrl: process.env.APP_URL || 'http://localhost:3001',
  bffUrl: process.env.BFF_URL || 'http://localhost:8090',
  claimsUrl: process.env.CLAIMS_URL || 'http://localhost:8080',
  users: {
    admin: {
      email: process.env.ADMIN_EMAIL || 'admin@example.com',
      password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'ADMIN',
    },
    claimant: {
      email: process.env.CLAIMANT_EMAIL || 'claimant@example.com',
      password: process.env.CLAIMANT_PASSWORD || 'ChangeMe123!',
      role: 'CLAIMANT',
    },
  },
};
