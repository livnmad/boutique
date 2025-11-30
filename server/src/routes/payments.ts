import { Router } from 'express';

function generateKey(length = 10) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

const router = Router();

// POST /api/payments
router.post('/', (req, res) => {
  // In a real integration, you would process payment here
  // For now, just return a confirmation code
  const confirmationCode = generateKey(10);
  res.json({ ok: true, confirmationCode });
});


export default router;
