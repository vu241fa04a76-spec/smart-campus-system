const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/notices
// @desc    Get all announcements
router.get('/', async (req, res) => {
  try {
    const list = await db.getNotices();
    return res.json(list);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/notices
// @desc    Publish an announcement
router.post('/', async (req, res) => {
  try {
    const { title, content, category, priority, postedBy, authorRole, targetAudience, pinned } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: 'Title and content are required' });
    }

    const notice = await db.createNotice({
      title,
      content,
      category: category || 'General',
      priority: priority || 'Normal',
      postedBy: postedBy || 'Administration',
      authorRole: authorRole || 'admin',
      targetAudience: targetAudience || 'All',
      pinned: Boolean(pinned)
    });

    return res.status(201).json({ message: 'Notice published', notice });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
