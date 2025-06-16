import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { jwTokens } from '../utils/jwt-helper.js';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = express.Router();

// Helper to find user across roles
const findUserById = async (id) => {
  let user = await prisma.patients.findUnique({ where: { patient_id: id } });
  if (user) return { user, role: 'patient' };

  user = await prisma.dentists.findUnique({ where: { dentist_id: id } });
  if (user) return { user, role: 'dentist' };

  user = await prisma.receptionists.findUnique({ where: { receptionist_id: id } });
  if (user) return { user, role: 'receptionist' };

  return { user: null, role: null };
};

router.post('/login', async (req, res) => {
  try {
    const { id, password, checked } = req.body;
    const { user, role } = await findUserById(id);

    if (!user) {
      return res.status(404).json({ successful: false, message: 'User not found' });
    }

    if (!user.password) {
      return res.json({ successful: false, message: 'Invalid password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.json({ successful: false, message: 'Invalid password' });
    }

    // Check if email is verified
    const verificationRecord = await prisma.email_verification.findUnique({
      where: { email: user.email }
    });

    if (verificationRecord) {
      return res.json({
        successful: false,
        message: 'Please verify your email before logging in',
        needsVerification: true,
        email: user.email
      });
    }

    const tokens = jwTokens(user[`${role}_id`], user.name, role);

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: checked ? 14 * 24 * 60 * 60 * 1000 : undefined,
    });

    console.log(`Login successful as a ${role}`);

    return res.json({
      successful: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      user: {
        email: user.email,
        name: user.name,
        role: role
      }
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).json({ error: err.message });
  }
});

router.post('/admin_login', async (req, res) => {
  const { id, password, checked } = req.body;
  try {
    const admin = await prisma.admins.findUnique({ where: { admin_id: id } });

    if (!admin || !admin.password) {
      return res.status(401).json({ successful: false, message: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, admin.password);
    if (!validPassword) {
      return res.status(401).json({ successful: false, message: 'Invalid credentials' });
    }

    const tokens = jwTokens(admin.admin_id, admin.name, "admin");

    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
      maxAge: checked ? 14 * 24 * 60 * 60 * 1000 : undefined,
    });

    return res.json({
      successful: true,
      message: 'Login successful',
      accessToken: tokens.accessToken,
      user: {
        email: admin.admin_id,
        name: admin.name,
        role: 'admin',
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/refresh_token', (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.json(false);
    }

    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY, (error, user) => {
      if (error) return res.status(403).json({ error: error.message });

      const { email, name, role } = user;
      const accessToken = jwt.sign({ email, name, role }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '15m',
      });

      res.json({ accessToken, user: { email, name, role } });
    });
  } catch (err) {
    console.error(err.message);
    return res.json(false);
  }
});

router.delete('/delete_token', (req, res) => {
  try {
    res.clearCookie('refreshToken', {
      httpOnly: true,
      sameSite: 'None',
      secure: true,
    });

    return res.status(200).json({ message: 'Refresh token deleted' });
  } catch (error) {
    res.status(401).json({ error: error.message });
  }
});

export default router;
