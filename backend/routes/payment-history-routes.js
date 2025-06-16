import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();

// appointment_id is PK and FK

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const payments = await prisma.payment_history.findMany();
    res.json(payments);
  } catch {
    res.status(500).json({ error: 'Failed to fetch payment histories' });
  }
});

router.get('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    const payment = await prisma.payment_history.findUnique({
      where: { appointment_id: Number(req.params.appointment_id) },
    });
    if (!payment) return res.status(404).json({ error: 'Not found' });
    res.json(payment);
  } catch {
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { appointment_id, payment_date, payment_time, reference_number } = req.body;

    // Check if payment history already exists for appointment_id
    const existing = await prisma.payment_history.findUnique({
      where: { appointment_id },
    });
    if (existing) return res.status(409).json({ error: 'Payment history already exists for this appointment' });

    const created = await prisma.payment_history.create({
      data: { appointment_id, payment_date, payment_time, reference_number },
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Failed to create payment history' });
  }
});

router.put('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    const appointment_id = Number(req.params.appointment_id);
    const { payment_date, payment_time, reference_number } = req.body;

    const updated = await prisma.payment_history.update({
      where: { appointment_id },
      data: { payment_date, payment_time, reference_number },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update payment history' });
  }
});

router.delete('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    await prisma.payment_history.delete({
      where: { appointment_id: Number(req.params.appointment_id) },
    });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete payment history' });
  }
});

export default router;
