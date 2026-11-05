const mongoose = require('mongoose');

const grievanceSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { 
    type: String, 
    enum: ['Electrical / Lighting', 'IT & Projector', 'HVAC / Air Conditioning', 'Plumbing / Water', 'Smart Access & Security', 'Cleanliness', 'Other'],
    default: 'IT & Projector' 
  },
  location: { type: String, required: true },
  facilityCode: { type: String },
  priority: { 
    type: String, 
    enum: ['Low', 'Medium', 'High', 'Emergency'], 
    default: 'Medium' 
  },
  status: { 
    type: String, 
    enum: ['Open', 'In Progress', 'Resolved', 'Closed'], 
    default: 'Open' 
  },
  reportedBy: { type: String, required: true },
  reporterRole: { type: String, default: 'student' },
  reporterEmail: { type: String },
  resolutionNotes: { type: String },
  resolvedAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Grievance', grievanceSchema);
