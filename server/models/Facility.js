const mongoose = require('mongoose');

const facilitySchema = new mongoose.Schema({
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  type: { 
    type: String, 
    enum: ['Classroom', 'Lab', 'Auditorium', 'Conference Room', 'Library'],
    default: 'Classroom' 
  },
  block: { type: String, default: 'Block A' },
  floor: { type: Number, default: 1 },
  capacity: { type: Number, required: true },
  isOccupied: { type: Boolean, default: false },
  currentActivity: { type: String, default: 'Free / Available' },
  powerConsumption: { type: Number, default: 1.2 }, // in kW
  smartDevices: {
    lights: { type: Boolean, default: false },
    airConditioner: { type: Boolean, default: false },
    acTemperature: { type: Number, default: 24 },
    projector: { type: Boolean, default: false },
    smartBoard: { type: Boolean, default: false },
    doorLock: { type: Boolean, default: true } // true = locked, false = unlocked
  },
  amenities: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Facility', facilitySchema);
