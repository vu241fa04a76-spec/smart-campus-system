# 🏫 Smart Campus Management System (Pure MERN Stack)

A full-stack Smart Campus Management System developed exclusively using the **MERN Stack** (**M**ongoDB, **E**xpress.js, **R**eact.js, **N**ode.js) with **pure JavaScript** and zero external language dependencies.

---

## 🔐 Authentication & Role Portals

The application features **separate authentication portals** with role boundaries and a **Logout** option:

### 1. 🎓 Student Portal Login
- **Login Credentials**:
  - **Student Roll ID**: `241FA04A76` *(or Email: `aarav.cs22@smartcampus.edu`)*
  - **Password**: `student123`
- **Capabilities**:
  - View real-time Smart Classroom availability & IoT statuses.
  - Submit facility reservations for study sessions or club activities.
  - Report campus infrastructure grievances & track repair status.
  - View official campus announcements.
  - **Simulate Contactless RFID Smart ID Card Tap** at lecture hall gate terminals.

### 2. 👨‍🏫 Faculty Portal Login
- **Login Credentials**:
  - **Faculty Employee ID**: `FAC-204` *(or Email: `anita.desai@smartcampus.edu`)*
  - **Password**: `faculty123`
- **Capabilities**:
  - Control laboratory & classroom IoT relays (Lighting, AC temperature, 4K Projectors, Smart Boards, Digital Locks).
  - Review & **Approve / Reject** student room reservations.
  - Mark and monitor course-wise student RFID attendance.
  - Broadcast academic notices.

### 3. 🛡️ Administrator Portal Login
- **Login Credentials**:
  - **Email**: `admin@smartcampus.edu`
  - **Password**: `admin123`
- **Capabilities**:
  - Master campus oversight and live grid power telemetry (in kW).
  - Resolve infrastructure maintenance tickets with technician logs.
  - Manage all facility schedules and publish campus-wide circulars.

### 🚪 User Logout
- Click the prominent **`🚪 Logout`** button in the top navbar at any time to terminate the active session and return to the Portal Login screen.

---

## 🌟 Key System Features

1. **📊 Live Campus Automation & Overview Dashboard**
   - Real-time campus KPI telemetry: Total facilities, active occupancy, maintenance status, active reservations.
   - **Live Campus Power Load Meter**: Dynamically calculates power draw in **kW** responding to active IoT equipment.
   - Automated Green Campus Eco-mode simulation.

2. **💡 Smart Classrooms & IoT Control Center**
   - Control panels for every lecture hall, computing lab, and auditorium across campus blocks.
   - **Live IoT Relays**: Toggle Smart Lights, Air Conditioners (with temperature control), 4K Laser Projectors, Smart Boards, and Smart RFID Door Locks.

3. **📅 Smart Facility Booking & Timetable Scheduling**
   - Reserve classrooms, seminar halls, and laboratories.
   - **Automated Conflict Detection**: Prevents double-booking during overlapping dates and time slots.
   - Role-based approvals: Students request; Faculty/Admin approve with one click.

4. **🛠️ Campus Grievance & Maintenance Ticketing**
   - Log campus infrastructure and equipment complaints (Electrical, IT/Projector, HVAC, Plumbing, Cleanliness).
   - Priority classification (`Emergency`, `High`, `Medium`, `Low`).
   - Ticket resolution status lifecycle: `Open` ➔ `In Progress` ➔ `Resolved`.

5. **📢 Digital Notice Board & Circular Broadcast**
   - Campus-wide and departmental announcements with priority badges.

6. **📱 Contactless RFID Smart ID Card Simulation**
   - Simulates physical contactless RFID / NFC student ID card tap at lecture hall gate terminals with live arrival timestamping.

---

## 🚀 Quick Start (Running the Application)

In your terminal within the project directory, run:

```bash
npm start
```
*(or run `node server/server.js` directly)*

Then open your browser and navigate to:
```
http://localhost:5000
```

---

## 📡 Authentication API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/login` | Authenticate with ID/Email, password, and portal role check |
| `POST` | `/api/auth/register` | Register a new Student or Faculty account |
| `GET` | `/api/auth/me` | Verify active session & return profile |
| `GET` | `/api/auth/users` | List demo accounts |
