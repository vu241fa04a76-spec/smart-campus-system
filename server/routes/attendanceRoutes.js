const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/attendance
// @desc    Get attendance records
router.get('/', async (req, res) => {
  try {
    const { courseCode, studentId } = req.query;
    const query = {};
    if (courseCode) query.courseCode = courseCode;
    if (studentId) query.studentId = studentId;

    const records = await db.getAttendance(query);
    return res.json(records);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/attendance/mark
// @desc    Mark attendance manually
router.post('/mark', async (req, res) => {
  try {
    const { studentName, studentId, courseCode, courseName, date, status, markedBy } = req.body;
    if (!studentName || !studentId || !courseCode) {
      return res.status(400).json({ error: 'Student and course details are required.' });
    }

    const record = await db.markAttendance({
      studentName,
      studentId,
      courseCode,
      courseName: courseName || courseCode,
      date: date || new Date().toISOString().slice(0, 10),
      status: status || 'Present',
      markedBy: markedBy || 'Faculty',
      rfidTapTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    });

    return res.status(201).json({ message: 'Attendance recorded', record });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/attendance/tap-rfid
// @desc    Simulate Smart RFID card tap at classroom entrance
router.post('/tap-rfid', async (req, res) => {
  try {
    const { studentId, courseCode } = req.body;
    const users = await db.getUsers();
    const student = users.find(u => u.studentId === studentId || u.role === 'student');

    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const isLate = now.getMinutes() > 15;

    const record = await db.markAttendance({
      studentName: student ? student.name : `Student (${studentId || '241FA04A76'})`,
      studentId: studentId || (student ? student.studentId : '241FA04A76'),
      courseCode: courseCode || 'CS301',
      courseName: 'Data Structures & Algorithms',
      date: now.toISOString().slice(0, 10),
      status: isLate ? 'Late' : 'Present',
      markedBy: 'Automated RFID Gate Terminal #3',
      rfidTapTime: timeStr
    });

    return res.status(201).json({
      message: `RFID Card Tap Recognized! Attendance logged as ${record.status}.`,
      record
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
