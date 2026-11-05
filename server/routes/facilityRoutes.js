const express = require('express');
const router = express.Router();
const { db } = require('../db');

// @route   GET /api/facilities
// @desc    Get all facilities with optional filtering
router.get('/', async (req, res) => {
  try {
    const { block, type } = req.query;
    const filter = {};
    if (block) filter.block = block;
    if (type) filter.type = type;

    const facilities = await db.getFacilities(filter);
    return res.json(facilities);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   GET /api/facilities/:id
// @desc    Get single facility
router.get('/:id', async (req, res) => {
  try {
    const facility = await db.getFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });
    return res.json(facility);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/facilities/:id/iot
// @desc    Toggle smart IoT device (lights, airConditioner, projector, etc.)
router.patch('/:id/iot', async (req, res) => {
  try {
    const { device, value } = req.body;
    const facility = await db.getFacilityById(req.params.id);
    if (!facility) return res.status(404).json({ error: 'Facility not found' });

    const updatedDevices = { ...facility.smartDevices, [device]: value };
    const updated = await db.updateFacility(req.params.id, { smartDevices: updatedDevices });
    return res.json({ message: 'IoT Device state updated', facility: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// @route   PATCH /api/facilities/:id/occupancy
// @desc    Toggle occupancy or current activity
router.patch('/:id/occupancy', async (req, res) => {
  try {
    const { isOccupied, currentActivity } = req.body;
    const updateData = {};
    if (typeof isOccupied === 'boolean') updateData.isOccupied = isOccupied;
    if (currentActivity) updateData.currentActivity = currentActivity;

    const updated = await db.updateFacility(req.params.id, updateData);
    return res.json({ message: 'Occupancy updated', facility: updated });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
