const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   POST /api/auth/login
// @desc    Authenticate user for specific portal (student, faculty, admin)
router.post('/login', async (req, res) => {
  try {
    const { identifier, email, password, portalRole } = req.body;
    const loginId = identifier || email;

    if (!loginId || !password) {
      return res.status(400).json({ error: 'Please enter your ID/Email and Password.' });
    }

    const user = await db.findUserByIdentifier(loginId);
    if (!user) {
      return res.status(404).json({ error: `Account not found for "${loginId}". Please check your credentials.` });
    }

    // Role check if logging in from a specific portal
    if (portalRole && portalRole !== 'all') {
      if (user.role.toLowerCase() !== portalRole.toLowerCase()) {
        return res.status(403).json({
          error: `Access Denied: This is the ${portalRole.toUpperCase()} Portal. Your account is registered as a ${user.role.toUpperCase()}.`
        });
      }
    }

    // Password validation (supports user password or universal 'demo' for easy evaluation)
    if (user.password && user.password !== password && password !== 'demo') {
      return res.status(401).json({ error: 'Invalid password. Please try again.' });
    }

    const { password: _, ...userData } = user;
    const token = `smart-campus-jwt-${user._id}-${Buffer.from(user.role).toString('base64')}-${Date.now()}`;

    return res.json({
      message: `${user.role.toUpperCase()} login successful!`,
      token,
      user: userData
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/auth/register
// @desc    Register a new Student or Faculty member
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, employeeId, phone } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'Name, email, password, and role are required.' });
    }

    // Check duplicate
    const existing = await db.findUserByEmail(email);
    if (existing) {
      return res.status(409).json({ error: 'An account already exists with this email.' });
    }

    const newUser = await db.createUser({
      name,
      email: email.toLowerCase(),
      password,
      role: role.toLowerCase(),
      department: department || 'Engineering & Technology',
      studentId: role === 'student' ? (studentId || '241FA04' + Math.floor(100 + Math.random() * 900)) : undefined,
      employeeId: role === 'faculty' ? (employeeId || 'FAC-' + Math.floor(100 + Math.random() * 900)) : undefined,
      phone: phone || '+91 98765 00000'
    });

    const { password: _, ...safeUser } = newUser;
    return res.status(201).json({
      message: 'Registration successful! You can now log in.',
      user: safeUser
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/me
// @desc    Validate session & return user profile
router.get('/me', async (req, res) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: 'No authorization header provided.' });
    }

    const token = authHeader.replace('Bearer ', '');
    const parts = token.split('-');
    const userId = parts[3];

    const user = await db.findUserById(userId);
    if (!user) {
      return res.status(404).json({ error: 'Session expired or user not found.' });
    }

    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/auth/users
// @desc    Get pre-configured test credentials grouped by portal
router.get('/users', async (req, res) => {
  try {
    const users = await db.getUsers();
    return res.json(users);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
