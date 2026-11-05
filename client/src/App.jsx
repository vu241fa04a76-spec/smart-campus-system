import React, { useState, useEffect } from 'react';

export default function App() {
  // Authentication & Session State
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const saved = localStorage.getItem('smart_campus_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });

  const [portalRole, setPortalRole] = useState('student'); // 'student' | 'faculty' | 'admin'
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [authLoading, setAuthLoading] = useState(false);

  // App Navigation & Data State
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [grievances, setGrievances] = useState([]);
  const [notices, setNotices] = useState([]);
  const [attendance, setAttendance] = useState([]);

  // Filters & Modals
  const [facilityFilter, setFacilityFilter] = useState('All');
  const [grievanceFilter, setGrievanceFilter] = useState('All');
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [selectedFacilityForBooking, setSelectedFacilityForBooking] = useState(null);
  const [showGrievanceModal, setShowGrievanceModal] = useState(false);
  const [showNoticeModal, setShowNoticeModal] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  useEffect(() => {
    if (currentUser) {
      loadData();
    }
  }, [currentUser]);

  const loadData = async () => {
    try {
      const [s, f, b, g, n, a] = await Promise.all([
        fetch('/api/stats/dashboard').then(r => r.json()),
        fetch('/api/facilities').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/grievances').then(r => r.json()),
        fetch('/api/notices').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json())
      ]);
      setStats(s); setFacilities(f); setBookings(b); setGrievances(g); setNotices(n); setAttendance(a);
    } catch (e) {
      console.error(e);
    }
  };

  // Login handler
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);
    const fd = new FormData(e.target);
    const identifier = fd.get('identifier');
    const password = fd.get('password');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, portalRole })
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Authentication failed');
        setAuthLoading(false);
        return;
      }
      localStorage.setItem('smart_campus_user', JSON.stringify(data.user));
      localStorage.setItem('smart_campus_token', data.token);
      setCurrentUser(data.user);
      setAuthLoading(false);
      showToast(`Welcome back, ${data.user.name}!`);
    } catch (err) {
      setAuthError('Connection error: ' + err.message);
      setAuthLoading(false);
    }
  };

  // Quick Demo Login
  const handleQuickDemoLogin = async (demoRole) => {
    setAuthError(null);
    setAuthLoading(true);
    let identifier = demoRole === 'student' ? '241FA04A76' : demoRole === 'faculty' ? 'FAC-204' : 'admin@smartcampus.edu';
    let password = demoRole === 'student' ? 'student123' : demoRole === 'faculty' ? 'faculty123' : 'admin123';

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, portalRole: demoRole })
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem('smart_campus_user', JSON.stringify(data.user));
        localStorage.setItem('smart_campus_token', data.token);
        setCurrentUser(data.user);
        showToast(`Logged in as ${data.user.name}`);
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Error during demo login');
    } finally {
      setAuthLoading(false);
    }
  };

  // Logout handler
  const handleLogout = () => {
    localStorage.removeItem('smart_campus_user');
    localStorage.removeItem('smart_campus_token');
    setCurrentUser(null);
    setActiveTab('overview');
    showToast('Logged out successfully');
  };

  const handleIoTToggle = async (facId, device, curVal) => {
    const res = await fetch(`/api/facilities/${facId}/iot`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ device, value: !curVal })
    });
    const d = await res.json();
    if (res.ok) {
      setFacilities(prev => prev.map(f => f._id === facId ? d.facility : f));
      fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
      showToast(`${device} updated in ${d.facility.name}`);
    }
  };

  const handleOccupancy = async (facId, cur) => {
    const res = await fetch(`/api/facilities/${facId}/occupancy`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isOccupied: !cur, currentActivity: !cur ? 'Occupied' : 'Free / Available' })
    });
    const d = await res.json();
    if (res.ok) {
      setFacilities(prev => prev.map(f => f._id === facId ? d.facility : f));
      fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
    }
  };

  const handleBooking = async (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const targetFac = selectedFacilityForBooking || facilities[0];
    const payload = {
      facilityId: targetFac._id,
      facilityName: targetFac.name,
      facilityCode: targetFac.code,
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      date: fd.get('date'),
      startTime: fd.get('startTime'),
      endTime: fd.get('endTime'),
      purpose: fd.get('purpose'),
      attendeesCount: fd.get('attendeesCount')
    };

    const res = await fetch('/api/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    if (!res.ok) {
      alert(data.error);
      return;
    }
    setBookings(prev => [data.booking, ...prev]);
    setShowBookingModal(false);
    showToast('Booking submitted successfully!');
    fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
  };

  const handleRfidTap = async () => {
    const res = await fetch('/api/attendance/tap-rfid', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ studentId: currentUser.studentId || '241FA04A76' })
    });
    const d = await res.json();
    if (res.ok) {
      setAttendance(prev => [d.record, ...prev]);
      showToast(d.message);
      fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
    }
  };

  // VIEW 1: AUTHENTICATION SCREEN
  if (!currentUser) {
    return (
      <div className="auth-wrapper">
        <div className="auth-card">
          <div className="auth-brand-center">
            <div className="auth-brand-logo">🏫</div>
            <h2>SMART CAMPUS OS</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '4px' }}>Pure MERN Stack • Authentication</p>
          </div>

          <div className="auth-portal-selector">
            <button
              className={`portal-tab-btn ${portalRole === 'student' ? 'active student' : ''}`}
              onClick={() => { setPortalRole('student'); setAuthError(null); }}
            >
              <span style={{ fontSize: '1.2rem' }}>🎓</span>
              <span>Student Portal</span>
            </button>
            <button
              className={`portal-tab-btn ${portalRole === 'faculty' ? 'active faculty' : ''}`}
              onClick={() => { setPortalRole('faculty'); setAuthError(null); }}
            >
              <span style={{ fontSize: '1.2rem' }}>👨‍🏫</span>
              <span>Faculty Portal</span>
            </button>
            <button
              className={`portal-tab-btn ${portalRole === 'admin' ? 'active admin' : ''}`}
              onClick={() => { setPortalRole('admin'); setAuthError(null); }}
            >
              <span style={{ fontSize: '1.2rem' }}>🛡️</span>
              <span>Admin Portal</span>
            </button>
          </div>

          <div className={`portal-info-box ${portalRole}`}>
            {portalRole === 'student' && '🎓 Log in using your Student Roll ID (e.g. 241FA04A76) or Student Email.'}
            {portalRole === 'faculty' && '👨‍🏫 Log in using your Faculty ID (e.g. FAC-204) or Faculty Email.'}
            {portalRole === 'admin' && '🛡️ Administrator credential authorization.'}
          </div>

          {authError && (
            <div className="auth-error-box">
              <span>⚠️</span>
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="form-group">
              <label className="form-label">
                {portalRole === 'student' ? 'Student Roll ID or Email' : portalRole === 'faculty' ? 'Faculty ID or Email' : 'Admin Email'}
              </label>
              <input
                type="text"
                name="identifier"
                required
                placeholder={portalRole === 'student' ? 'e.g. 241FA04A76' : portalRole === 'faculty' ? 'e.g. FAC-204' : 'admin@smartcampus.edu'}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input type="password" name="password" required placeholder="••••••••" className="form-input" />
            </div>
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '8px', padding: '12px' }} disabled={authLoading}>
              {authLoading ? 'Verifying...' : `Log In to ${portalRole.toUpperCase()} Portal →`}
            </button>

            <div className="demo-credentials-card">
              <div className="demo-title">
                <span>⚡ Quick Demo Evaluation</span>
                <span style={{ color: '#38bdf8' }}>1-Click Login</span>
              </div>
              <button type="button" className="btn-quick-fill" onClick={() => handleQuickDemoLogin(portalRole)}>
                {portalRole === 'student' ? 'Log in as Aarav Patel (Student)' : portalRole === 'faculty' ? 'Log in as Prof. Anita Desai (Faculty)' : 'Log in as Dr. Rajesh Sharma (Admin)'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // VIEW 2: LOGGED-IN DASHBOARD
  return (
    <div>
      <header className="navbar">
        <div className="brand">
          <div className="brand-icon">🏫</div>
          <div>
            <div className="brand-title">SMART CAMPUS OS</div>
            <div className="brand-subtitle">{currentUser.role.toUpperCase()} PORTAL</div>
          </div>
        </div>
        <div className="nav-user-area">
          <div className="online-pill"><div className="pulse-dot"></div> Live</div>
          <div className="user-badge-container">
            <div className="user-avatar-circle">{currentUser.name.charAt(0)}</div>
            <div>
              <div className="user-name-text">{currentUser.name}</div>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                {currentUser.role === 'student' ? `Roll: ${currentUser.studentId || '241FA04A76'}` : currentUser.role === 'faculty' ? `ID: ${currentUser.employeeId || 'FAC-204'}` : 'Admin'}
              </div>
            </div>
            <span className={`user-role-tag ${currentUser.role}`}>{currentUser.role}</span>
          </div>
          <button className="btn-logout" onClick={handleLogout} title="Sign Out">
            <span>🚪</span>
            <span>Logout</span>
          </button>
        </div>
      </header>

      <main className="main-container">
        <div className="tabs-bar">
          {[
            { id: 'overview', label: '📊 Campus Overview' },
            { id: 'facilities', label: '💡 Smart Classrooms & IoT' },
            { id: 'bookings', label: '📅 Facility Bookings' },
            { id: 'grievances', label: '🛠️ Maintenance Tickets' },
            { id: 'notices', label: '📢 Notice Board' },
            { id: 'attendance', label: '📱 Smart RFID Attendance' }
          ].map(t => (
            <button
              key={t.id}
              className={`tab-btn ${activeTab === t.id ? 'active' : ''}`}
              onClick={() => setActiveTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>

        {activeTab === 'overview' && stats && (
          <div>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-header">Smart Facilities <span>🏢</span></div>
                <div className="stat-value">{stats.facilities.total}</div>
                <div className="stat-footer">{stats.facilities.occupied} Occupied</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">Campus Power <span>⚡</span></div>
                <div className="stat-value" style={{ color: '#fbbf24' }}>{stats.energy.totalPowerKw} kW</div>
                <div className="stat-footer">{stats.energy.activeAcCount} ACs running</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">Reservations <span>📅</span></div>
                <div className="stat-value">{stats.bookings.todayCount}</div>
                <div className="stat-footer">{stats.bookings.pendingApprovals} Pending</div>
              </div>
              <div className="stat-card">
                <div className="stat-header">Maintenance <span>🔧</span></div>
                <div className="stat-value" style={{ color: stats.grievances.open > 0 ? '#f87171' : '#34d399' }}>
                  {stats.grievances.open}
                </div>
                <div className="stat-footer">{stats.grievances.resolved} Resolved</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'facilities' && (
          <div className="facilities-grid">
            {facilities.map(fac => (
              <div key={fac._id} className="facility-card">
                <div className="facility-top">
                  <div>
                    <span className="facility-name">{fac.name}</span>
                    <span className="facility-code">{fac.code}</span>
                    <div className="facility-loc">{fac.block} • Capacity: {fac.capacity}</div>
                  </div>
                  <span
                    className={`occupancy-badge ${fac.isOccupied ? 'occupied' : 'available'}`}
                    onClick={() => handleOccupancy(fac._id, fac.isOccupied)}
                    style={{ cursor: 'pointer' }}
                  >
                    {fac.isOccupied ? 'Occupied' : 'Available'}
                  </span>
                </div>
                <div className="current-activity">{fac.currentActivity}</div>
                <div className="iot-controls-box">
                  <div className="iot-header">
                    <span>IoT Controls</span>
                    <span className="power-meter">⚡ {fac.powerConsumption} kW</span>
                  </div>
                  <div className="iot-switches-grid">
                    <button
                      className={`iot-switch-btn ${fac.smartDevices.lights ? 'active' : ''}`}
                      onClick={() => handleIoTToggle(fac._id, 'lights', fac.smartDevices.lights)}
                    >
                      💡 Lights <div className="iot-dot" />
                    </button>
                    <button
                      className={`iot-switch-btn ${fac.smartDevices.airConditioner ? 'active' : ''}`}
                      onClick={() => handleIoTToggle(fac._id, 'airConditioner', fac.smartDevices.airConditioner)}
                    >
                      ❄️ AC <div className="iot-dot" />
                    </button>
                    <button
                      className={`iot-switch-btn ${fac.smartDevices.projector ? 'active' : ''}`}
                      onClick={() => handleIoTToggle(fac._id, 'projector', fac.smartDevices.projector)}
                    >
                      📽️ Projector <div className="iot-dot" />
                    </button>
                    <button
                      className={`iot-switch-btn ${!fac.smartDevices.doorLock ? 'active' : ''}`}
                      onClick={() => handleIoTToggle(fac._id, 'doorLock', fac.smartDevices.doorLock)}
                    >
                      {fac.smartDevices.doorLock ? '🔒 Locked' : '🔓 Unlocked'} <div className="iot-dot" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'attendance' && (
          <div>
            <div className="section-header">
              <h3>RFID Contactless Tap Simulation</h3>
              <button className="btn-primary" onClick={handleRfidTap}>📲 Tap Smart ID Card</button>
            </div>
            <div className="table-container">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Student Roll ID</th>
                    <th>Course</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {attendance.map(a => (
                    <tr key={a._id}>
                      <td><strong>{a.studentName}</strong></td>
                      <td>{a.studentId}</td>
                      <td>{a.courseCode}</td>
                      <td>{a.date}</td>
                      <td>{a.rfidTapTime || '--'}</td>
                      <td><span className={`status-badge ${a.status}`}>{a.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {toast && (
        <div className="toast-container">
          <div className="toast">🔔 {toast}</div>
        </div>
      )}
    </div>
  );
}
