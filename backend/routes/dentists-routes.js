import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import { sendAccountCreationNotice } from '../utils/mailer.js';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();
const SALT_ROUNDS = 10;

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const dentists = await prisma.dentists.findMany();
    res.json(dentists);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dentists' });
  }
});

router.get('/count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.dentists.count();
    res.json(count);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dentists' });
  }
});

router.get('/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    const dentist = await prisma.dentists.findUnique({
      where: { dentist_id: req.params.dentist_id },
    });
    if (!dentist) return res.status(404).json({ error: 'Not found' });
    res.json(dentist);
  } catch {
    res.status(500).json({ error: 'Failed to fetch dentist' });
  }
});

router.get('/getworkinfo/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    const dentist = await prisma.dentists.findUnique({
      where: { dentist_id: req.params.dentist_id },
      select: {
        work_days_from: true,
        work_days_to: true,
        work_time_from: true,
        work_time_to: true,
        appointment_duration: true,
        appointment_fee: true
      },
    });
    if (!dentist) return res.status(404).json({ error: 'Not found' });
    res.json(dentist);
  } catch(err) {
    console.log(err)
    res.status(500).json({ error: 'Failed to fetch dentist' });
  }
});

router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { password, email, ...rest } = req.body;

    const existing = await prisma.dentists.findUnique({
      where: { email: email },
    });
    if (existing) {
      return res.status(409).json({ error: 'Dentist already exists' });
    }
    const count = await prisma.dentists.count();
    let new_dentist_id = `knrsdent${(count + 1).toString().padStart(3, '0')}`;

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const newDentist = await prisma.dentists.create({
      data: { dentist_id :new_dentist_id, password: hashedPassword, ...rest },
    });
    sendAccountCreationNotice(email, new_dentist_id);
    res.status(201).json(newDentist);
  } catch {
    res.status(500).json({ error: 'Failed to create dentist' });
  }
});

router.put('/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    const { password, ...rest } = req.body;
    let data = { ...rest };
    if (password) {
      const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
      data.password = hashedPassword;
    }
    const updatedDentist = await prisma.dentists.update({
      where: { dentist_id: req.params.dentist_id },
      data,
    });
    res.json(updatedDentist);
  } catch {
    res.status(500).json({ error: 'Failed to update dentist' });
  }
});

router.delete('/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    await prisma.dentists.delete({
      where: { dentist_id: req.params.dentist_id },
    });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete dentist' });
  }
});

export default router;
