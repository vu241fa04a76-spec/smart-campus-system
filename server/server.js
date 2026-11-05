const express = require('express');
const cors = require('cors');
const path = require('path');
const { connectDB } = require('./db');

// Route Handlers
const authRoutes = require('./routes/authRoutes');
const facilityRoutes = require('./routes/facilityRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const grievanceRoutes = require('./routes/grievanceRoutes');
const noticeRoutes = require('./routes/noticeRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const statsRoutes = require('./routes/statsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve frontend static files
const publicDir = path.join(__dirname, 'public');
app.use(express.static(publicDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/facilities', facilityRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/grievances', grievanceRoutes);
app.use('/api/notices', noticeRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/stats', statsRoutes);

// System Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    app: 'Smart Campus Management System (MERN Stack)',
    timestamp: new Date().toISOString()
  });
});

// Single Page Application Fallback
app.use((req, res, next) => {
  // If request accepts html and not an API call
  if (req.method === 'GET' && !req.path.startsWith('/api')) {
    const indexPath = path.join(publicDir, 'index.html');
    return res.sendFile(indexPath);
  }
  next();
});

// Start Server
async function startServer() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('====================================================');
    console.log(`  SMART CAMPUS MANAGEMENT SYSTEM`);
    console.log(`  MERN Stack: MongoDB | Express | React | Node.js`);
    console.log(`  Server running at: http://localhost:${PORT}`);
    console.log(`  API Health check:  http://localhost:${PORT}/api/health`);
    console.log('====================================================');
  });
}

startServer();
