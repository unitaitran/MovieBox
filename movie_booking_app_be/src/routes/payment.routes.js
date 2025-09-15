const express = require('express');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

// Protected routes
router.use(protect); // All payment routes require authentication

router.get('/', getPayments);
router.get('/:id', getPayment);
router.post('/', createPayment);
router.put('/:id', updatePayment);
router.post('/:id/process', processPayment);
router.post('/:id/refund', refundPayment);

module.exports = router;
