const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  facilityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility' },
  facilityName: { type: String, required: true },
  facilityCode: { type: String },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  userName: { type: String, required: true },
  userRole: { type: String, default: 'student' },
  userEmail: { type: String },
  date: { type: String, required: true }, // Format: YYYY-MM-DD
  startTime: { type: String, required: true }, // e.g. "09:00"
  endTime: { type: String, required: true },   // e.g. "11:00"
  purpose: { type: String, required: true },
  attendeesCount: { type: Number, default: 20 },
  status: { 
    type: String, 
    enum: ['Approved', 'Pending', 'Rejected', 'Cancelled'],
    default: 'Approved' 
  },
  remarks: { type: String },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Booking', bookingSchema);
