const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Academic', 'Smart Campus Alert', 'Events & Workshops', 'Maintenance', 'General'],
    default: 'General' 
  },
  priority: { 
    type: String, 
    enum: ['Normal', 'Important', 'Urgent'],
    default: 'Normal' 
  },
  postedBy: { type: String, default: 'Campus Administration' },
  authorRole: { type: String, default: 'admin' },
  targetAudience: { 
    type: String, 
    enum: ['All', 'Students', 'Faculty'],
    default: 'All' 
  },
  pinned: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notice', noticeSchema);
