import express from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();
const SALT_ROUNDS = 10;

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const patients = await prisma.patients.findMany();
    res.json(patients);
  } catch {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.patients.count();
    res.json(count);
  } catch {
    res.status(500).json({ error: 'Failed to fetch patients' });
  }
});

router.get('/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const patient = await prisma.patients.findUnique({
      where: { patient_id: req.params.patient_id },
    });
    if (!patient) return res.status(404).json({ error: 'Not found' });
    res.json(patient);
  } catch {
    res.status(500).json({ error: 'Failed to fetch patient' });
  }
});

router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const {
      patient_id,
      password,
      name,
      profile_picture,
      email,
      phone_number,
      address,
      nic,
      blood_group,
      date_of_birth,
      gender,
    } = req.body;

    // Check if patient_id or email or nic already exists
    const existingById = await prisma.patients.findUnique({ where: { patient_id } });
    if (existingById) return res.status(409).json({ error: 'Patient ID already exists' });

    const existingByEmail = await prisma.patients.findUnique({ where: { email } });
    if (existingByEmail) return res.status(409).json({ error: 'Email already exists' });

    if (nic) {
      const existingByNic = await prisma.patients.findUnique({ where: { nic } });
      if (existingByNic) return res.status(409).json({ error: 'NIC already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    const created = await prisma.patients.create({
      data: {
        patient_id,
        password: hashedPassword,
        name,
        profile_picture,
        email,
        phone_number,
        address,
        nic,
        blood_group,
        date_of_birth,
        gender,
      },
    });

    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Failed to create patient' });
  }
});

router.put('/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const patient_id = req.params.patient_id;
    const {
      password,
      name,
      profile_picture,
      email,
      phone_number,
      address,
      nic,
      blood_group,
      date_of_birth,
      gender,
    } = req.body;

    // If email or nic is being updated, check for uniqueness
    if (email) {
      const existingByEmail = await prisma.patients.findFirst({
        where: { email, patient_id: { not: patient_id } },
      });
      if (existingByEmail) return res.status(409).json({ error: 'Email already exists' });
    }
    if (nic) {
      const existingByNic = await prisma.patients.findFirst({
        where: { nic, patient_id: { not: patient_id } },
      });
      if (existingByNic) return res.status(409).json({ error: 'NIC already exists' });
    }

    const dataToUpdate = {
      name,
      profile_picture,
      email,
      phone_number,
      address,
      nic,
      blood_group,
      date_of_birth,
      gender,
    };

    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, SALT_ROUNDS);
    }

    const updated = await prisma.patients.update({
      where: { patient_id },
      data: dataToUpdate,
    });

    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update patient' });
  }
});

router.delete('/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    await prisma.patients.delete({ where: { patient_id: req.params.patient_id } });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete patient' });
  }
});

export default router;
