const mongoose = require('mongoose');
const initialData = require('./data/mockData');
const User = require('./models/User');
const Facility = require('./models/Facility');
const Booking = require('./models/Booking');
const Grievance = require('./models/Grievance');
const Notice = require('./models/Notice');
const Attendance = require('./models/Attendance');

let isMongoConnected = false;

// In-Memory store as resilient fallback
const memoryStore = {
  users: JSON.parse(JSON.stringify(initialData.users)),
  facilities: JSON.parse(JSON.stringify(initialData.facilities)),
  bookings: JSON.parse(JSON.stringify(initialData.bookings)),
  grievances: JSON.parse(JSON.stringify(initialData.grievances)),
  notices: JSON.parse(JSON.stringify(initialData.notices)),
  attendanceRecords: JSON.parse(JSON.stringify(initialData.attendanceRecords))
};

async function connectDB() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/smart_campus';
  try {
    // Attempt MongoDB connection with fast 1s timeout for instant startup
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 1000
    });
    isMongoConnected = true;
    console.log(`[Database] MongoDB connected successfully at ${mongoUri}`);

    // Seed initial campus data if collections are empty
    await seedMongoDatabase();
  } catch (error) {
    isMongoConnected = false;
    console.log('[Database] MongoDB daemon not running locally.');
    console.log('[Database] Gracefully activated High-Speed Smart Campus In-Memory Data Store.');
    console.log('[Database] All CRUD operations, smart IoT controls, bookings & grievances will operate seamlessly.');
  }
}

async function seedMongoDatabase() {
  try {
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('[Database] Seeding initial campus data to MongoDB...');
      await User.insertMany(initialData.users.map(({ _id, ...u }) => u));
      await Facility.insertMany(initialData.facilities.map(({ _id, ...f }) => f));
      await Grievance.insertMany(initialData.grievances.map(({ _id, ...g }) => g));
      await Notice.insertMany(initialData.notices.map(({ _id, ...n }) => n));
      await Attendance.insertMany(initialData.attendanceRecords.map(({ _id, ...a }) => a));
      console.log('[Database] Seed completed successfully!');
    }
  } catch (err) {
    console.warn('[Database] Seed notice:', err.message);
  }
}

// Data Access Layer (automatically routes to MongoDB or In-Memory)
const db = {
  isMongo: () => isMongoConnected,

  // USERS
  getUsers: async () => {
    if (isMongoConnected) return await User.find().select('-password');
    return memoryStore.users.map(({ password, ...u }) => u);
  },
  findUserByEmail: async (email) => {
    if (isMongoConnected) return await User.findOne({ email });
    return memoryStore.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  },
  findUserByIdentifier: async (identifier) => {
    const clean = (identifier || '').trim().toLowerCase();
    if (isMongoConnected) {
      return await User.findOne({
        $or: [
          { email: new RegExp('^' + clean + '$', 'i') },
          { studentId: new RegExp('^' + clean + '$', 'i') },
          { employeeId: new RegExp('^' + clean + '$', 'i') }
        ]
      });
    }
    return memoryStore.users.find(u => 
      u.email.toLowerCase() === clean || 
      (u.studentId && u.studentId.toLowerCase() === clean) ||
      (u.employeeId && u.employeeId.toLowerCase() === clean)
    );
  },
  createUser: async (userData) => {
    if (isMongoConnected) {
      const u = new User(userData);
      return await u.save();
    }
    const newUser = {
      _id: 'u' + Date.now(),
      createdAt: new Date(),
      ...userData
    };
    memoryStore.users.push(newUser);
    return newUser;
  },
  findUserById: async (id) => {
    if (isMongoConnected) return await User.findById(id).select('-password');
    const user = memoryStore.users.find(u => u._id === id);
    if (!user) return null;
    const { password, ...safeUser } = user;
    return safeUser;
  },

  // FACILITIES
  getFacilities: async (filter = {}) => {
    if (isMongoConnected) return await Facility.find(filter);
    return memoryStore.facilities.filter(f => {
      if (filter.block && f.block !== filter.block) return false;
      if (filter.type && f.type !== filter.type) return false;
      return true;
    });
  },
  getFacilityById: async (id) => {
    if (isMongoConnected) return await Facility.findById(id);
    return memoryStore.facilities.find(f => f._id === id);
  },
  updateFacility: async (id, updateData) => {
    if (isMongoConnected) {
      return await Facility.findByIdAndUpdate(id, updateData, { new: true });
    }
    const idx = memoryStore.facilities.findIndex(f => f._id === id);
    if (idx !== -1) {
      memoryStore.facilities[idx] = { ...memoryStore.facilities[idx], ...updateData };
      // Recalculate power consumption dynamically based on IoT devices
      const dev = memoryStore.facilities[idx].smartDevices;
      let power = 0.2; // standby
      if (dev.lights) power += 0.8;
      if (dev.airConditioner) power += 1.8;
      if (dev.projector) power += 0.4;
      if (dev.smartBoard) power += 0.3;
      memoryStore.facilities[idx].powerConsumption = Number(power.toFixed(1));
      return memoryStore.facilities[idx];
    }
    return null;
  },

  // BOOKINGS
  getBookings: async () => {
    if (isMongoConnected) return await Booking.find().sort({ createdAt: -1 });
    return memoryStore.bookings;
  },
  createBooking: async (bookingData) => {
    if (isMongoConnected) {
      const b = new Booking(bookingData);
      return await b.save();
    }
    const newBooking = {
      _id: 'b' + Date.now(),
      createdAt: new Date(),
      status: 'Approved',
      ...bookingData
    };
    memoryStore.bookings.unshift(newBooking);
    return newBooking;
  },
  updateBookingStatus: async (id, status, remarks = '') => {
    if (isMongoConnected) {
      return await Booking.findByIdAndUpdate(id, { status, remarks }, { new: true });
    }
    const b = memoryStore.bookings.find(item => item._id === id);
    if (b) {
      b.status = status;
      if (remarks) b.remarks = remarks;
      return b;
    }
    return null;
  },

  // GRIEVANCES (MAINTENANCE)
  getGrievances: async () => {
    if (isMongoConnected) return await Grievance.find().sort({ createdAt: -1 });
    return memoryStore.grievances;
  },
  createGrievance: async (data) => {
    if (isMongoConnected) {
      const g = new Grievance(data);
      return await g.save();
    }
    const newG = {
      _id: 'g' + Date.now(),
      createdAt: new Date(),
      status: 'Open',
      resolutionNotes: '',
      ...data
    };
    memoryStore.grievances.unshift(newG);
    return newG;
  },
  updateGrievance: async (id, updateData) => {
    if (isMongoConnected) {
      return await Grievance.findByIdAndUpdate(id, updateData, { new: true });
    }
    const idx = memoryStore.grievances.findIndex(g => g._id === id);
    if (idx !== -1) {
      memoryStore.grievances[idx] = { ...memoryStore.grievances[idx], ...updateData };
      if (updateData.status === 'Resolved' && !memoryStore.grievances[idx].resolvedAt) {
        memoryStore.grievances[idx].resolvedAt = new Date();
      }
      return memoryStore.grievances[idx];
    }
    return null;
  },

  // NOTICES
  getNotices: async () => {
    if (isMongoConnected) return await Notice.find().sort({ pinned: -1, createdAt: -1 });
    return memoryStore.notices.sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
  },
  createNotice: async (data) => {
    if (isMongoConnected) {
      const n = new Notice(data);
      return await n.save();
    }
    const newN = {
      _id: 'n' + Date.now(),
      createdAt: new Date(),
      pinned: false,
      ...data
    };
    memoryStore.notices.unshift(newN);
    return newN;
  },

  // ATTENDANCE
  getAttendance: async (query = {}) => {
    if (isMongoConnected) return await Attendance.find(query).sort({ date: -1 });
    return memoryStore.attendanceRecords.filter(a => {
      if (query.courseCode && a.courseCode !== query.courseCode) return false;
      if (query.studentId && a.studentId !== query.studentId) return false;
      return true;
    });
  },
  markAttendance: async (record) => {
    if (isMongoConnected) {
      const a = new Attendance(record);
      return await a.save();
    }
    const newRecord = {
      _id: 'a' + Date.now(),
      createdAt: new Date(),
      ...record
    };
    memoryStore.attendanceRecords.unshift(newRecord);
    return newRecord;
  }
};

module.exports = { connectDB, db };
