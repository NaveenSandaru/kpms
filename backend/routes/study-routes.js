import express from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Get all studies
router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const studies = await prisma.study.findMany({
      include: {
        patient: true,
        radiologist: true,
        report: true
      }
    });
    res.json(studies);
  } catch (error) {
    console.error('Error fetching studies:', error);
    res.status(500).json({ error: 'Failed to fetch studies' });
  }
});

// Get a single study by ID
router.get('/:study_id', /* authenticateToken, */ async (req, res) => {
  try {
    const study = await prisma.study.findUnique({
      where: { study_id: parseInt(req.params.study_id) },
      include: {
        patient: true,
        radiologist: true,
        report: true
      }
    });
    
    if (!study) {
      return res.status(404).json({ error: 'Study not found' });
    }
    
    res.json(study);
  } catch (error) {
    console.error('Error fetching study:', error);
    res.status(500).json({ error: 'Failed to fetch study' });
  }
});

// Get studies by patient ID
router.get('/patient/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const studies = await prisma.study.findMany({
      where: { patient_id: req.params.patient_id },
      include: {
        radiologist: true,
        report: true,
        status: true
      },
      orderBy: [
        { date: 'desc' },
        { time: 'desc' }
      ]
    });
    
    res.json(studies);
  } catch (error) {
    console.error('Error fetching patient studies:', error);
    res.status(500).json({ error: 'Failed to fetch patient studies' });
  }
});

// Create a new study
router.post('/', /* authenticateToken, */ async (req, res) => {
  try {
    const data = { ...req.body }; 
    console.debug(data);
    const newStudy = await prisma.study.create({
      data,
      include: {
        patient: true,
        radiologist: true,
        report: true
      }
    });
    
    res.status(201).json(newStudy);
  } catch (error) {
    console.error('Error creating study:', error);
    res.status(500).json({ error: 'Failed to create study', details: error.message });
  }
});

// Update a study
router.put('/:study_id', /* authenticateToken, */ async (req, res) => {
  try {
    const studyId = parseInt(req.params.study_id);
    const data = { ...req.body };
    
    // Update study
    const updatedStudy = await prisma.study.update({
      where: { study_id: studyId },
      data
    });
    
    res.json(updatedStudy);
  } catch (error) {
    console.error('Error updating study:', error);
    res.status(500).json({ error: 'Failed to update study', details: error.message });
  }
});

// Delete a study
router.delete('/:study_id', /* authenticateToken, */ async (req, res) => {
  try {
    const studyId = parseInt(req.params.study_id);

    // Check if study exists
    const existingStudy = await prisma.study.findUnique({
      where: { study_id: studyId }
    });
    
    if (!existingStudy) {
      return res.status(404).json({ error: 'Study not found' });
    }

    await prisma.study.delete({
      where: { study_id: studyId }
    });

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting study:', error);
    res.status(500).json({ error: 'Failed to delete study', details: error.message });
  }
});

export default router;