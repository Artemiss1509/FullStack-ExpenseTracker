import { Router } from 'express';
import { paymentProcess, getPremiumStatus } from '../controllers/cashfree.controller.js';
import { getPaymentStatus } from '../services/cashfree.js';
import authorise from '../controllers/auth.controller.js';

const router = Router();

router.post('/create-order',authorise, paymentProcess);
// router.get('/:id', getPaymentStatus )
router.get('/premium-status', authorise, getPremiumStatus);

export default router;