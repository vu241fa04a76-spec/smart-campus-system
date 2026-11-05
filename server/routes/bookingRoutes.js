const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/bookings
// @desc    Get all campus facility reservations
router.get('/', async (req, res) => {
  try {
    const bookings = await db.getBookings();
    return res.json(bookings);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   POST /api/bookings
// @desc    Reserve a facility with conflict verification
router.post('/', async (req, res) => {
  try {
    const { facilityId, facilityName, facilityCode, userName, userRole, userEmail, date, startTime, endTime, purpose, attendeesCount } = req.body;

    if (!facilityName || !date || !startTime || !endTime || !purpose) {
      return res.status(400).json({ error: 'Please provide facility, date, time slots, and purpose.' });
    }

    // Check for scheduling conflicts in approved/pending bookings
    const allBookings = await db.getBookings();
    const conflict = allBookings.find(b => {
      if (b.status === 'Cancelled' || b.status === 'Rejected') return false;
      const sameFacility = (b.facilityId && facilityId && b.facilityId.toString() === facilityId.toString()) || 
                           (b.facilityName.toLowerCase() === facilityName.toLowerCase());
      const sameDate = b.date === date;
      if (!sameFacility || !sameDate) return false;

      // Time overlap check: start1 < end2 && end1 > start2
      return (startTime < b.endTime && endTime > b.startTime);
    });

    if (conflict) {
      return res.status(409).json({
        error: `Schedule conflict! ${facilityName} is already reserved on ${date} from ${conflict.startTime} to ${conflict.endTime} for "${conflict.purpose}".`
      });
    }

    const newBooking = await db.createBooking({
      facilityId,
      facilityName,
      facilityCode: facilityCode || 'FAC',
      userName: userName || 'Campus Member',
      userRole: userRole || 'student',
      userEmail: userEmail || 'user@smartcampus.edu',
      date,
      startTime,
      endTime,
      purpose,
      attendeesCount: Number(attendeesCount) || 30,
      status: userRole === 'admin' || userRole === 'faculty' ? 'Approved' : 'Pending'
    });

    return res.status(201).json({
      message: 'Booking submitted successfully',
      booking: newBooking
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/bookings/:id/status
// @desc    Approve, Reject, or Cancel booking
router.patch('/:id/status', async (req, res) => {
  try {
    const { status, remarks } = req.body;
    if (!['Approved', 'Pending', 'Rejected', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Invalid booking status' });
    }

    const updated = await db.updateBookingStatus(req.params.id, status, remarks);
    if (!updated) return res.status(404).json({ error: 'Booking not found' });

    return res.json({ message: `Booking marked as ${status}`, booking: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
