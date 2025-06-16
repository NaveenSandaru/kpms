import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany();
    res.json(appointments);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    const appointment = await prisma.appointments.findUnique({
      where: { appointment_id: Number(req.params.appointment_id) },
    });
    if (!appointment) return res.status(404).json({ error: 'Not found' });
    res.json(appointment);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointment' });
  }
});

router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const data = { ...req.body, date: new Date(req.body.date) };
    const newAppointment = await prisma.appointments.create({ data });
    res.status(201).json(newAppointment);
  } catch {
    res.status(500).json({ error: 'Failed to create appointment' });
  }
});

router.put('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    const data = req.body;
    if (data.date) data.date = new Date(data.date);
    const updated = await prisma.appointments.update({
      where: { appointment_id: Number(req.params.appointment_id) },
      data,
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update appointment' });
  }
});

router.delete('/:appointment_id', /* authenticateToken, */ async (req, res) => {
  try {
    await prisma.appointments.delete({
      where: { appointment_id: Number(req.params.appointment_id) },
    });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete appointment' });
  }
});

export default router;
