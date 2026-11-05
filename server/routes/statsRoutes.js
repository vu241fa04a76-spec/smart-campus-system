const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/stats/dashboard
// @desc    Calculate campus wide real-time metrics
router.get('/dashboard', async (req, res) => {
  try {
    const facilities = await db.getFacilities();
    const bookings = await db.getBookings();
    const grievances = await db.getGrievances();
    const notices = await db.getNotices();
    const attendance = await db.getAttendance();

    const totalFacilities = facilities.length;
    const occupiedFacilities = facilities.filter(f => f.isOccupied).length;
    
    // Calculate total campus live power load
    const totalPowerKw = facilities.reduce((sum, f) => sum + (f.powerConsumption || 0), 0);

    const openGrievances = grievances.filter(g => g.status === 'Open' || g.status === 'In Progress').length;
    const resolvedGrievances = grievances.filter(g => g.status === 'Resolved').length;

    const todayStr = new Date().toISOString().slice(0, 10);
    const todayBookings = bookings.filter(b => b.date === todayStr);

    const presentCount = attendance.filter(a => a.status === 'Present').length;
    const totalAttendanceMarked = attendance.length;
    const attendanceRate = totalAttendanceMarked > 0 ? Math.round((presentCount / totalAttendanceMarked) * 100) : 100;

    return res.json({
      facilities: {
        total: totalFacilities,
        occupied: occupiedFacilities,
        available: totalFacilities - occupiedFacilities,
        occupancyRate: Math.round((occupiedFacilities / (totalFacilities || 1)) * 100)
      },
      energy: {
        totalPowerKw: Number(totalPowerKw.toFixed(1)),
        activeLightsCount: facilities.filter(f => f.smartDevices && f.smartDevices.lights).length,
        activeAcCount: facilities.filter(f => f.smartDevices && f.smartDevices.airConditioner).length,
        activeDisplaysCount: facilities.filter(f => f.smartDevices && (f.smartDevices.projector || f.smartDevices.smartBoard)).length
      },
      bookings: {
        total: bookings.length,
        todayCount: todayBookings.length,
        pendingApprovals: bookings.filter(b => b.status === 'Pending').length
      },
      grievances: {
        open: openGrievances,
        resolved: resolvedGrievances,
        total: grievances.length
      },
      noticesCount: notices.length,
      attendance: {
        rate: attendanceRate,
        recordsCount: totalAttendanceMarked
      },
      system: {
        databaseMode: db.isMongo() ? 'MongoDB (Live Persistence)' : 'High-Performance In-Memory (Active Auto-Fallback)',
        uptime: Math.round(process.uptime()),
        serverTime: new Date().toLocaleTimeString()
      }
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
