export const users = {
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com',
    password: process.env.ADMIN_PASSWORD || 'ChangeMe123!',
  },
  claimant: {
    email: process.env.CLAIMANT_EMAIL || 'claimant@example.com',
    password: process.env.CLAIMANT_PASSWORD || 'ChangeMe123!',
  },
};
