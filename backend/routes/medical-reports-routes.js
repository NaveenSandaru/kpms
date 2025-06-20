import express from 'express';
import { PrismaClient } from '@prisma/client';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const reports = await prisma.medical_reports.findMany();
    res.json(reports);
  } catch {
    res.status(500).json({ error: 'Failed to fetch medical reports' });
  }
});

router.get('/:report_id', /* authenticateToken, */ async (req, res) => {
  try {
    const report = await prisma.medical_reports.findUnique({
      where: { report_id: Number(req.params.report_id) },
    });
    if (!report) return res.status(404).json({ error: 'Not found' });
    res.json(report);
  } catch {
    res.status(500).json({ error: 'Failed to fetch medical report' });
  }
});

router.get('/forpatient/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const reports = await prisma.medical_reports.findMany({
      where: { patient_id: req.params.patient_id },
    });
    if (!reports) return res.status(404).json({ error: 'Not found' });
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch medical report' });
  }
});

router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const { patient_id, record_url, record_name } = req.body;
    const created = await prisma.medical_reports.create({
      data: { patient_id, record_url, record_name },
    });
    res.status(201).json(created);
  } catch {
    res.status(500).json({ error: 'Failed to create medical report' });
  }
});

router.put('/:report_id', /* authenticateToken, */ async (req, res) => {
  try {
    const report_id = Number(req.params.report_id);
    const { patient_id, record_url, record_name } = req.body;
    const updated = await prisma.medical_reports.update({
      where: { report_id },
      data: { patient_id, record_url, record_name },
    });
    res.json(updated);
  } catch {
    res.status(500).json({ error: 'Failed to update medical report' });
  }
});

router.delete('/:report_id', /* authenticateToken, */ async (req, res) => {
  try {
    await prisma.medical_reports.delete({
      where: { report_id: Number(req.params.report_id) },
    });
    res.json({ message: 'Deleted' });
  } catch {
    res.status(500).json({ error: 'Failed to delete medical report' });
  }
});

export default router;
