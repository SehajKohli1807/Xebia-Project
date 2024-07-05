import express from 'express';
import { createTransaction, getTransactions } from '../controllers/transactionController.js';
import auth from '../middlewares/authMiddleware.js';

const router = express.Router();

router.post('/transaction', auth, createTransaction);
router.get('/transactions', auth, getTransactions);

export default router;
