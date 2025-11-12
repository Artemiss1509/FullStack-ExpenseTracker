import { Router } from 'express';
import { paymentProcess } from '../controllers/cashfree.controller.js';
import { getPaymentStatus } from '../services/cashfree.js';

const router = Router();

router.post('/create-order', paymentProcess);
router.post('/:paymentSessionId', getPaymentStatus )

export default router;