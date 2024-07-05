import Transaction from '../models/Transaction.js';
import User from '../models/User.js';

export const createTransaction = async (req, res) => {
  const { amount, type } = req.body;
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }

    if (type === 'withdraw' && user.balance < amount) {
      return res.status(400).json({ msg: 'Insufficient balance' });
    }

    const transaction = new Transaction({
      user: userId,
      amount,
      type,
    });

    await transaction.save();

    if (type === 'withdraw') {
      user.balance -= amount;
    } else if (type === 'deposit') {
      user.balance += amount;
    } else {
      return res.status(400).json({ msg: 'Invalid transaction type' });
    }

    await user.save();
    res.json(transaction);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};

export const getTransactions = async (req, res) => {
  const userId = req.user.id;

  try {
    const transactions = await Transaction.find({ user: userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
};
