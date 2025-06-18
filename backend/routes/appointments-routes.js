import express from 'express';
import { PrismaClient } from '@prisma/client';
import { DateTime } from 'luxon';
// import { authenticateToken } from '../middleware/authentication.js';

const prisma = new PrismaClient();
const router = express.Router();

router.get('/', /* authenticateToken, */ async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany({
      include: {
        patient: {
          select: {
            patient_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        dentist: {
          select: {
            dentist_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/fordentist/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany({
      where:{dentist_id: req.params.dentist_id},
      include: {
        patient: {
          select: {
            patient_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        dentist: {
          select: {
            dentist_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/forpatient/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const appointments = await prisma.appointments.findMany({
      where:{patient_id: req.params.patient_id},
      include: {
        patient: {
          select: {
            patient_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        dentist: {
          select: {
            dentist_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });
    res.json(appointments);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/today/fordentist/:dentist_id', /* authenticateToken, */ async (req, res) => {
  try {
    const colomboNow = DateTime.now().setZone('Asia/Colombo');

    const startOfToday = colomboNow.startOf('day').toJSDate();
    const startOfTomorrow = colomboNow.plus({ days: 1 }).startOf('day').toJSDate();

    const appointments = await prisma.appointments.findMany({
      where: {
        dentist_id: req.params.dentist_id,
        date: {
          gte: startOfToday,
          lt: startOfTomorrow
        }
      },
      include: {
        patient: {
          select: {
            patient_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        dentist: {
          select: {
            dentist_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ error: "Failed to fetch today's appointments" });
  }
});

router.get('/today/forpatient/:patient_id', /* authenticateToken, */ async (req, res) => {
  try {
    const colomboNow = DateTime.now().setZone('Asia/Colombo');

    const startOfToday = colomboNow.startOf('day').toJSDate();
    const startOfTomorrow = colomboNow.plus({ days: 1 }).startOf('day').toJSDate();

    const appointments = await prisma.appointments.findMany({
      where: {
        patient_id: req.params.patient_id,
        date: {
          gte: startOfToday,
          lt: startOfTomorrow
        }
      },
      include: {
        patient: {
          select: {
            patient_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        },
        dentist: {
          select: {
            dentist_id: true,
            name: true,
            email: true,
            profile_picture: true
          }
        }
      }
    });

    res.json(appointments);
  } catch (error) {
    console.error("Error fetching today's appointments:", error);
    res.status(500).json({ error: "Failed to fetch today's appointments" });
  }
});

router.get('/count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.appointments.count();
    res.json(count);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/pending-count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.appointments.count({where:{status:"pending"}});
    res.json(count);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/completed-count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.appointments.count({where:{status:"completed"}});
    res.json(count);
  } catch {
    res.status(500).json({ error: 'Failed to fetch appointments' });
  }
});

router.get('/confirmed-count', /* authenticateToken, */ async (req, res) => {
  try {
    const count = await prisma.appointments.count({where:{status:"confirmed"}});
    res.json(count);
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
