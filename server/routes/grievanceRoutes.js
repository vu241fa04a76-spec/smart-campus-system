const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/grievances
// @desc    List all maintenance grievances
router.get('/', async (req, res) => {
  try {
    const list = await db.getGrievances();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/grievances
// @desc    File a new maintenance grievance
router.post('/', async (req, res) => {
  try {
    const { title, description, category, location, facilityCode, priority, reportedBy, reporterRole, reporterEmail } = req.body;
    if (!title || !description || !location) {
      return res.status(400).json({ error: 'Title, description, and location are required.' });
    }

    const newGrievance = await db.createGrievance({
      title,
      description,
      category: category || 'IT & Projector',
      location,
      facilityCode: facilityCode || '',
      priority: priority || 'Medium',
      reportedBy: reportedBy || 'Student',
      reporterRole: reporterRole || 'student',
      reporterEmail: reporterEmail || 'student@smartcampus.edu'
    });

    return res.status(201).json({
      message: 'Grievance ticket created successfully',
      grievance: newGrievance
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/grievances/:id
// @desc    Update ticket status or resolution notes
router.patch('/:id', async (req, res) => {
  try {
    const { status, resolutionNotes, priority } = req.body;
    const updateData = {};
    if (status) updateData.status = status;
    if (resolutionNotes !== undefined) updateData.resolutionNotes = resolutionNotes;
    if (priority) updateData.priority = priority;

    const updated = await db.updateGrievance(req.params.id, updateData);
    if (!updated) return res.status(404).json({ error: 'Grievance not found' });

    return res.json({ message: 'Grievance updated successfully', grievance: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
