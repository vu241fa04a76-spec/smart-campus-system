// Seed & Mock Data for Smart Campus Management System

const users = [
  {
    _id: "u1",
    name: "Dr. Rajesh Sharma",
    email: "admin@smartcampus.edu",
    password: "admin123", // in production use bcrypt
    role: "admin",
    department: "Campus Administration",
    employeeId: "ADM-101",
    phone: "+91 98765 43210"
  },
  {
    _id: "u2",
    name: "Prof. Anita Desai",
    email: "anita.desai@smartcampus.edu",
    password: "faculty123",
    role: "faculty",
    department: "Computer Science & Engineering",
    employeeId: "FAC-204",
    phone: "+91 98765 43211"
  },
  {
    _id: "u3",
    name: "Prof. Vikram Reddy",
    email: "vikram.reddy@smartcampus.edu",
    password: "faculty123",
    role: "faculty",
    department: "Electrical & Electronics Engineering",
    employeeId: "FAC-309",
    phone: "+91 98765 43212"
  },
  {
    _id: "u4",
    name: "Aarav Patel",
    email: "aarav.cs22@smartcampus.edu",
    password: "student123",
    role: "student",
    department: "Computer Science & Engineering",
    studentId: "241FA04A76",
    phone: "+91 98765 43213"
  },
  {
    _id: "u5",
    name: "Sneha Mukherjee",
    email: "sneha.ee23@smartcampus.edu",
    password: "student123",
    role: "student",
    department: "Electrical & Electronics Engineering",
    studentId: "241FA04B12",
    phone: "+91 98765 43214"
  }
];

const facilities = [
  {
    _id: "f1",
    name: "Smart Lecture Hall 101",
    code: "LH-101",
    type: "Classroom",
    block: "Academic Block A",
    floor: 1,
    capacity: 80,
    isOccupied: true,
    currentActivity: "CS301 - Data Structures Lecture (Prof. Anita)",
    powerConsumption: 2.8,
    smartDevices: {
      lights: true,
      airConditioner: true,
      acTemperature: 23,
      projector: true,
      smartBoard: true,
      doorLock: false
    },
    amenities: ["Interactive 4K Display", "Surround Audio", "Dual 2-Ton Inverter AC", "Occupancy Sensors"]
  },
  {
    _id: "f2",
    name: "IoT & Embedded Systems Lab",
    code: "LAB-204",
    type: "Lab",
    block: "Engineering Block B",
    floor: 2,
    capacity: 45,
    isOccupied: true,
    currentActivity: "Hands-on Sensor Interfacing Lab",
    powerConsumption: 3.4,
    smartDevices: {
      lights: true,
      airConditioner: true,
      acTemperature: 22,
      projector: false,
      smartBoard: true,
      doorLock: false
    },
    amenities: ["Oscilloscopes & Logic Analyzers", "Raspberry Pi & ESP32 Racks", "High-Speed WiFi 6"]
  },
  {
    _id: "f3",
    name: "AI & High-Performance Computing Lab",
    code: "HPC-305",
    type: "Lab",
    block: "Tech Tower C",
    floor: 3,
    capacity: 50,
    isOccupied: false,
    currentActivity: "Available for Project Work",
    powerConsumption: 0.5,
    smartDevices: {
      lights: false,
      airConditioner: false,
      acTemperature: 24,
      projector: false,
      smartBoard: false,
      doorLock: true
    },
    amenities: ["NVIDIA RTX GPU Workstations", "Smart Climate Control", "Biometric Access"]
  },
  {
    _id: "f4",
    name: "Central Campus Auditorium",
    code: "AUD-001",
    type: "Auditorium",
    block: "Main Administration Block",
    floor: 1,
    capacity: 450,
    isOccupied: false,
    currentActivity: "Scheduled for Tech Symposium (2:00 PM)",
    powerConsumption: 0.8,
    smartDevices: {
      lights: false,
      airConditioner: false,
      acTemperature: 21,
      projector: false,
      smartBoard: false,
      doorLock: true
    },
    amenities: ["Digital Stage Lighting", "Dolby Atmos Audio", "Dual Laser Projectors", "Live Streaming Rack"]
  },
  {
    _id: "f5",
    name: "Executive Conference Hall",
    code: "CONF-202",
    type: "Conference Room",
    block: "Academic Block A",
    floor: 2,
    capacity: 30,
    isOccupied: true,
    currentActivity: "Faculty Academic Council Meeting",
    powerConsumption: 1.6,
    smartDevices: {
      lights: true,
      airConditioner: true,
      acTemperature: 24,
      projector: true,
      smartBoard: false,
      doorLock: false
    },
    amenities: ["Video Conferencing Bar", "Wireless Screen Casting", "Motorized Blinds"]
  },
  {
    _id: "f6",
    name: "Digital Central Library - Group Study Room",
    code: "LIB-102",
    type: "Library",
    block: "Knowledge Center",
    floor: 1,
    capacity: 25,
    isOccupied: false,
    currentActivity: "Available for Student Reservation",
    powerConsumption: 0.3,
    smartDevices: {
      lights: true,
      airConditioner: false,
      acTemperature: 25,
      projector: false,
      smartBoard: false,
      doorLock: false
    },
    amenities: ["E-Catalog Terminals", "Whiteboard Wall", "Quiet Zone Acoustic Panels"]
  }
];

const bookings = [
  {
    _id: "b1",
    facilityId: "f1",
    facilityName: "Smart Lecture Hall 101",
    facilityCode: "LH-101",
    userId: "u2",
    userName: "Prof. Anita Desai",
    userRole: "faculty",
    userEmail: "anita.desai@smartcampus.edu",
    date: new Date().toISOString().slice(0, 10),
    startTime: "09:00",
    endTime: "11:00",
    purpose: "CS301 Data Structures Theory & Problem Solving",
    attendeesCount: 75,
    status: "Approved",
    remarks: "Regular timetable class"
  },
  {
    _id: "b2",
    facilityId: "f2",
    facilityName: "IoT & Embedded Systems Lab",
    facilityCode: "LAB-204",
    userId: "u3",
    userName: "Prof. Vikram Reddy",
    userRole: "faculty",
    userEmail: "vikram.reddy@smartcampus.edu",
    date: new Date().toISOString().slice(0, 10),
    startTime: "11:30",
    endTime: "13:30",
    purpose: "IoT Microcontroller Practical Lab Session",
    attendeesCount: 42,
    status: "Approved",
    remarks: "Lab assistants notified"
  },
  {
    _id: "b3",
    facilityId: "f4",
    facilityName: "Central Campus Auditorium",
    facilityCode: "AUD-001",
    userId: "u4",
    userName: "Aarav Patel",
    userRole: "student",
    userEmail: "aarav.cs22@smartcampus.edu",
    date: new Date().toISOString().slice(0, 10),
    startTime: "14:00",
    endTime: "17:00",
    purpose: "Smart Campus Innovation Hackathon Briefing",
    attendeesCount: 220,
    status: "Approved",
    remarks: "Approved by Admin"
  },
  {
    _id: "b4",
    facilityId: "f3",
    facilityName: "AI & High-Performance Computing Lab",
    facilityCode: "HPC-305",
    userId: "u5",
    userName: "Sneha Mukherjee",
    userRole: "student",
    userEmail: "sneha.ee23@smartcampus.edu",
    date: new Date().toISOString().slice(0, 10),
    startTime: "16:00",
    endTime: "18:00",
    purpose: "Deep Learning Model Training & GPU Access",
    attendeesCount: 15,
    status: "Pending",
    remarks: "Awaiting Lab In-charge confirmation"
  }
];

const grievances = [
  {
    _id: "g1",
    title: "Laser Projector Color Flickering",
    description: "The laser projector in LH-101 is exhibiting yellow hue tint and intermittent signal flickering during HDMI input.",
    category: "IT & Projector",
    location: "Academic Block A - LH-101",
    facilityCode: "LH-101",
    priority: "High",
    status: "In Progress",
    reportedBy: "Prof. Anita Desai",
    reporterRole: "faculty",
    reporterEmail: "anita.desai@smartcampus.edu",
    resolutionNotes: "IT technician assigned. Replacement HDMI 2.1 cable issued.",
    createdAt: new Date(Date.now() - 3600000 * 5)
  },
  {
    _id: "g2",
    title: "Air Conditioner Not Cooling Properly",
    description: "The AC unit 2 in LAB-204 is blowing ambient air and making a vibrating humming noise.",
    category: "HVAC / Air Conditioning",
    location: "Engineering Block B - LAB-204",
    facilityCode: "LAB-204",
    priority: "Medium",
    status: "Open",
    reportedBy: "Aarav Patel",
    reporterRole: "student",
    reporterEmail: "aarav.cs22@smartcampus.edu",
    resolutionNotes: "",
    createdAt: new Date(Date.now() - 3600000 * 12)
  },
  {
    _id: "g3",
    title: "Smart Door RFID Sensor Read Failure",
    description: "Digital RFID reader at HPC-305 entrance takes multiple taps to authenticate student smart ID cards.",
    category: "Smart Access & Security",
    location: "Tech Tower C - HPC-305",
    facilityCode: "HPC-305",
    priority: "High",
    status: "Resolved",
    reportedBy: "Prof. Vikram Reddy",
    reporterRole: "faculty",
    reporterEmail: "vikram.reddy@smartcampus.edu",
    resolutionNotes: "Firmware updated on ESP32 RFID controller board. Calibrated antenna coil.",
    resolvedAt: new Date(Date.now() - 3600000 * 2),
    createdAt: new Date(Date.now() - 3600000 * 24)
  },
  {
    _id: "g4",
    title: "Water Cooler Filter Replacement Required",
    description: "Drinking water dispenser filter indicator on 2nd Floor Block B shows red replacement light.",
    category: "Plumbing / Water",
    location: "Engineering Block B - 2nd Floor Corridor",
    facilityCode: "CORR-B2",
    priority: "Low",
    status: "Open",
    reportedBy: "Sneha Mukherjee",
    reporterRole: "student",
    reporterEmail: "sneha.ee23@smartcampus.edu",
    resolutionNotes: "",
    createdAt: new Date(Date.now() - 3600000 * 28)
  }
];

const notices = [
  {
    _id: "n1",
    title: "Smart Campus Energy Optimization Protocol (Phase 2)",
    content: "All faculty and student lab heads are reminded that smart classroom air conditioners are auto-calibrated to 24°C from 12:00 PM to 4:00 PM to minimize peak campus grid load. Motion sensors will power down empty labs after 15 minutes of inactivity.",
    category: "Smart Campus Alert",
    priority: "Important",
    postedBy: "Dr. Rajesh Sharma (Campus Admin)",
    authorRole: "admin",
    targetAudience: "All",
    pinned: true,
    createdAt: new Date(Date.now() - 3600000 * 8)
  },
  {
    _id: "n2",
    title: "Annual Smart Campus Hackathon 2026 - Registrations Open",
    content: "Registrations are now open for the 36-hour National Smart Campus & IoT Hackathon. Themes include Green Campus AI, Smart Water Management, and Autonomous Drone Surveillance. Submit your team proposals by the 15th.",
    category: "Events & Workshops",
    priority: "Normal",
    postedBy: "Prof. Anita Desai",
    authorRole: "faculty",
    targetAudience: "Students",
    pinned: true,
    createdAt: new Date(Date.now() - 3600000 * 20)
  },
  {
    _id: "n3",
    title: "Mid-Semester Practical Examination Schedule Released",
    content: "The lab practical exam timetable for CS, IT, and EEE streams is published on the digital notice portal. Students must carry their RFID-enabled Smart Student ID Card for biometric lab entrance.",
    category: "Academic",
    priority: "Urgent",
    postedBy: "Academic Examination Cell",
    authorRole: "admin",
    targetAudience: "Students",
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 48)
  },
  {
    _id: "n4",
    title: "Central Server Maintenance & WiFi Access Point Upgrades",
    content: "Core network backbone switches will undergo security patch updates this Saturday from 11:00 PM to 3:00 AM. Intermittent campus LAN / WiFi disruptions may occur during this maintenance window.",
    category: "Maintenance",
    priority: "Normal",
    postedBy: "Campus IT Systems Directorate",
    authorRole: "admin",
    targetAudience: "All",
    pinned: false,
    createdAt: new Date(Date.now() - 3600000 * 72)
  }
];

const attendanceRecords = [
  {
    _id: "a1",
    studentName: "Aarav Patel",
    studentId: "241FA04A76",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    markedBy: "Prof. Anita Desai",
    rfidTapTime: "08:58 AM"
  },
  {
    _id: "a2",
    studentName: "Sneha Mukherjee",
    studentId: "241FA04B12",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    markedBy: "Prof. Anita Desai",
    rfidTapTime: "09:02 AM"
  },
  {
    _id: "a3",
    studentName: "Rohan Varma",
    studentId: "241FA04A33",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    date: new Date().toISOString().slice(0, 10),
    status: "Late",
    markedBy: "Prof. Anita Desai",
    rfidTapTime: "09:20 AM"
  },
  {
    _id: "a4",
    studentName: "Pooja Hegde",
    studentId: "241FA04A55",
    courseCode: "CS301",
    courseName: "Data Structures & Algorithms",
    date: new Date().toISOString().slice(0, 10),
    status: "Absent",
    markedBy: "Prof. Anita Desai",
    rfidTapTime: "--"
  },
  {
    _id: "a5",
    studentName: "Aarav Patel",
    studentId: "241FA04A76",
    courseCode: "EE204",
    courseName: "Embedded Microcontrollers",
    date: new Date().toISOString().slice(0, 10),
    status: "Present",
    markedBy: "Prof. Vikram Reddy",
    rfidTapTime: "11:25 AM"
  }
];

module.exports = {
  users,
  facilities,
  bookings,
  grievances,
  notices,
  attendanceRecords
};
