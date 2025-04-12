import express from 'express';
import Payment from '../models/payment.js';
import { isAuth, isAdmin } from '../util.js';

const router = express.Router();

router.get('/', isAuth, async (req, res) => {
  const filters = {
    ...(req.query.paymentStatus && { paymentStatus: req.query.paymentStatus }),
    ...(req.query.paymentSender && { paymentSender: req.query.paymentSender }),
    ...(req.query.paymentRecipient && { paymentRecipient: req.query.paymentRecipient }),
  };

  try {
    const payments = await Payment.find(filters).populate('paymentInvoiceId');
    res.send({ message: 'Payments retrieved successfully', data: payments });
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

router.get('/:id', isAuth, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('paymentInvoiceId');
    if (payment) {
      res.send(payment);
    } else {
      res.status(404).send({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.post('/', isAuth, async (req, res) => {
  try {
    const payment = new Payment({
      paymentNo: req.body.paymentNo,
      paymentInvoiceId: req.body.paymentInvoiceId,
      paymentType: req.body.paymentType,
      paymentSender: req.body.paymentSender,
      paymentRecipient: req.body.paymentRecipient,
      paymentStatus: req.body.paymentStatus || 'pending',
      paymentComment: req.body.paymentComment,
      paymentAmount: req.body.paymentAmount,
      paymentMintAddress: req.body.paymentMintAddress,
      paymentChain: req.body.paymentChain,
    });

    const newPayment = await payment.save();
    res.status(201).send({ message: 'Payment created successfully', data: newPayment });
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.put('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (payment) {
      payment.paymentType = req.body.paymentType || payment.paymentType;
      payment.paymentSender = req.body.paymentSender || payment.paymentSender;
      payment.paymentRecipient = req.body.paymentRecipient || payment.paymentRecipient;
      payment.paymentStatus = req.body.paymentStatus || payment.paymentStatus;
      payment.paymentComment = req.body.paymentComment || payment.paymentComment;
      payment.paymentAmount = req.body.paymentAmount ?? payment.paymentAmount;
      payment.paymentMintAddress = req.body.paymentMintAddress || payment.paymentMintAddress;
      payment.paymentChain = req.body.paymentChain || payment.paymentChain;

      const updated = await payment.save();
      res.send({ message: 'Payment updated successfully', data: updated });
    } else {
      res.status(404).send({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(400).send({ message: error.message });
  }
});

router.delete('/:id', isAuth, isAdmin, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (payment) {
      await payment.remove();
      res.send({ message: 'Payment deleted' });
    } else {
      res.status(404).send({ message: 'Payment not found' });
    }
  } catch (error) {
    res.status(500).send({ message: error.message });
  }
});

export default router;
