const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema({
  studentName: { type: String, required: true },
  studentId: { type: String, required: true },
  courseCode: { type: String, required: true },
  courseName: { type: String, required: true },
  date: { type: String, required: true }, // YYYY-MM-DD
  status: { 
    type: String, 
    enum: ['Present', 'Absent', 'Late', 'Excused'],
    default: 'Present' 
  },
  markedBy: { type: String, default: 'Faculty' },
  rfidTapTime: { type: String }, // e.g. "09:02 AM" (Smart campus RFID/NFC feature simulation)
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Attendance', attendanceSchema);
