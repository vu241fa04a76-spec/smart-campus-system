/**
 * Smart Campus Management System - Pure React 18 Application
 * Includes Separate Student, Faculty, & Admin Login Portals, Real Authentication, & Logout.
 */

const { useState, useEffect, createElement: h } = React;

function App() {
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

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 3500);
  };

  // Load campus data when user is authenticated
  useEffect(() => {
    if (currentUser) {
      loadAllData();
    }
  }, [currentUser]);

  const loadAllData = async () => {
    try {
      const [statsRes, facRes, bookRes, grievRes, notRes, attRes] = await Promise.all([
        fetch('/api/stats/dashboard').then(r => r.json()),
        fetch('/api/facilities').then(r => r.json()),
        fetch('/api/bookings').then(r => r.json()),
        fetch('/api/grievances').then(r => r.json()),
        fetch('/api/notices').then(r => r.json()),
        fetch('/api/attendance').then(r => r.json())
      ]);

      setStats(statsRes);
      setFacilities(facRes);
      setBookings(bookRes);
      setGrievances(grievRes);
      setNotices(notRes);
      setAttendance(attRes);
    } catch (err) {
      console.error('Error fetching campus data:', err);
    }
  };

  // Handle User Login
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const formData = new FormData(e.target);
    const identifier = formData.get('identifier');
    const password = formData.get('password');

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

      // Save session
      localStorage.setItem('smart_campus_user', JSON.stringify(data.user));
      localStorage.setItem('smart_campus_token', data.token);
      setCurrentUser(data.user);
      setAuthLoading(false);
      showToast(`Welcome back, ${data.user.name}! (${data.user.role.toUpperCase()})`);
    } catch (err) {
      setAuthError('Connection error: ' + err.message);
      setAuthLoading(false);
    }
  };

  // Handle Quick Demo Login
  const handleQuickDemoLogin = async (demoRole) => {
    setAuthError(null);
    setAuthLoading(true);

    let identifier = '';
    let password = '';

    if (demoRole === 'student') {
      identifier = '241FA04A76'; // Student Roll ID
      password = 'student123';
    } else if (demoRole === 'faculty') {
      identifier = 'FAC-204'; // Faculty Employee ID
      password = 'faculty123';
    } else {
      identifier = 'admin@smartcampus.edu';
      password = 'admin123';
    }

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
        showToast(`Logged in as ${data.user.name} (${data.user.role.toUpperCase()})`);
      } else {
        setAuthError(data.error);
      }
    } catch (err) {
      setAuthError('Error during demo login');
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle User Registration
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);
    setAuthLoading(true);

    const formData = new FormData(e.target);
    const payload = {
      name: formData.get('name'),
      email: formData.get('email'),
      password: formData.get('password'),
      role: portalRole,
      department: formData.get('department'),
      studentId: portalRole === 'student' ? formData.get('studentId') : undefined,
      employeeId: portalRole === 'faculty' ? formData.get('employeeId') : undefined
    };

    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        setAuthError(data.error || 'Registration failed');
        setAuthLoading(false);
        return;
      }

      showToast('Registration successful! Please log in.');
      setIsRegisterMode(false);
    } catch (err) {
      setAuthError('Error during registration: ' + err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    localStorage.removeItem('smart_campus_user');
    localStorage.removeItem('smart_campus_token');
    setCurrentUser(null);
    setActiveTab('overview');
    showToast('Logged out successfully. Have a nice day!');
  };

  // IoT Device Relay Toggle
  const handleIoTDeviceToggle = async (facilityId, device, currentValue) => {
    const newValue = !currentValue;
    try {
      const res = await fetch(`/api/facilities/${facilityId}/iot`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ device, value: newValue })
      });
      const data = await res.json();
      if (res.ok) {
        setFacilities(prev => prev.map(f => f._id === facilityId ? data.facility : f));
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
        showToast(`${device.toUpperCase()} turned ${newValue ? 'ON' : 'OFF'} in ${data.facility.name}`);
      }
    } catch (err) {
      showToast('Error updating device state');
    }
  };

  // Toggle Room Occupancy
  const handleOccupancyToggle = async (facilityId, currentOccupied) => {
    const nextOccupied = !currentOccupied;
    try {
      const res = await fetch(`/api/facilities/${facilityId}/occupancy`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          isOccupied: nextOccupied,
          currentActivity: nextOccupied ? 'Occupied (Active Session)' : 'Free / Available'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setFacilities(prev => prev.map(f => f._id === facilityId ? data.facility : f));
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
        showToast(`Room marked as ${nextOccupied ? 'Occupied' : 'Available'}`);
      }
    } catch (err) {
      showToast('Failed to toggle occupancy');
    }
  };

  // Create Booking
  const handleCreateBooking = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const targetFac = selectedFacilityForBooking || facilities[0];
    const payload = {
      facilityId: targetFac ? targetFac._id : 'f1',
      facilityName: targetFac ? targetFac.name : 'Classroom',
      facilityCode: targetFac ? targetFac.code : 'FAC',
      userName: currentUser.name,
      userRole: currentUser.role,
      userEmail: currentUser.email,
      date: formData.get('date'),
      startTime: formData.get('startTime'),
      endTime: formData.get('endTime'),
      purpose: formData.get('purpose'),
      attendeesCount: formData.get('attendeesCount')
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || 'Scheduling conflict or booking error');
        return;
      }
      setBookings(prev => [data.booking, ...prev]);
      setShowBookingModal(false);
      showToast(`Reservation submitted (${data.booking.status})`);
      fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
    } catch (err) {
      alert('Error creating booking: ' + err.message);
    }
  };

  // Update Booking Status (Approve / Reject / Cancel)
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/bookings/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (res.ok) {
        setBookings(prev => prev.map(b => b._id === id ? data.booking : b));
        showToast(`Reservation marked as ${status}`);
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
      }
    } catch (err) {
      showToast('Status update failed');
    }
  };

  // File Grievance Ticket
  const handleCreateGrievance = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      location: formData.get('location'),
      priority: formData.get('priority'),
      description: formData.get('description'),
      reportedBy: currentUser.name,
      reporterRole: currentUser.role,
      reporterEmail: currentUser.email
    };

    try {
      const res = await fetch('/api/grievances', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setGrievances(prev => [data.grievance, ...prev]);
        setShowGrievanceModal(false);
        showToast('Maintenance ticket reported successfully');
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
      }
    } catch (err) {
      alert('Error filing grievance: ' + err.message);
    }
  };

  // Resolve Grievance Ticket
  const handleResolveGrievance = async (id) => {
    const notes = prompt('Enter resolution notes:', 'Resolved by facility electrician / technician.');
    if (notes === null) return;

    try {
      const res = await fetch(`/api/grievances/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Resolved', resolutionNotes: notes })
      });
      const data = await res.json();
      if (res.ok) {
        setGrievances(prev => prev.map(g => g._id === id ? data.grievance : g));
        showToast('Ticket marked as Resolved!');
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
      }
    } catch (err) {
      showToast('Error updating ticket');
    }
  };

  // Publish Notice
  const handleCreateNotice = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const payload = {
      title: formData.get('title'),
      category: formData.get('category'),
      priority: formData.get('priority'),
      content: formData.get('content'),
      postedBy: `${currentUser.name} (${currentUser.role.toUpperCase()})`,
      authorRole: currentUser.role,
      pinned: formData.get('pinned') === 'on'
    };

    try {
      const res = await fetch('/api/notices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setNotices(prev => [data.notice, ...prev]);
        setShowNoticeModal(false);
        showToast('Announcement published!');
      }
    } catch (err) {
      alert('Error posting notice');
    }
  };

  // Simulate Contactless RFID Smart Card Tap
  const handleSimulateRfidTap = async () => {
    try {
      const res = await fetch('/api/attendance/tap-rfid', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: currentUser.studentId || '241FA04A76',
          courseCode: 'CS301'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setAttendance(prev => [data.record, ...prev]);
        showToast(data.message);
        fetch('/api/stats/dashboard').then(r => r.json()).then(setStats);
      }
    } catch (err) {
      showToast('RFID Gate connection error');
    }
  };

  // ==============================================================
  // VIEW 1: AUTHENTICATION & LOGIN SCREEN (If not logged in)
  // ==============================================================
  if (!currentUser) {
    return h('div', { className: 'auth-wrapper' },
      h('div', { className: 'auth-card' },
        h('div', { className: 'auth-brand-center' },
          h('div', { className: 'auth-brand-logo' }, '🏫'),
          h('h2', { style: { fontSize: '1.45rem', fontWeight: 800, color: '#f8fafc', letterSpacing: '-0.5px' } }, 
            'SMART CAMPUS OS'
          ),
          h('p', { style: { fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' } }, 
            'Pure MERN Stack • Authentication & Role Portals'
          )
        ),

        // 3 Separate Portals Selector (Student, Faculty, Admin)
        h('div', { className: 'auth-portal-selector' },
          h('button', {
            className: `portal-tab-btn ${portalRole === 'student' ? 'active student' : ''}`,
            onClick: () => { setPortalRole('student'); setAuthError(null); }
          },
            h('span', { style: { fontSize: '1.2rem' } }, '🎓'),
            h('span', null, 'Student Portal')
          ),
          h('button', {
            className: `portal-tab-btn ${portalRole === 'faculty' ? 'active faculty' : ''}`,
            onClick: () => { setPortalRole('faculty'); setAuthError(null); }
          },
            h('span', { style: { fontSize: '1.2rem' } }, '👨‍🏫'),
            h('span', null, 'Faculty Portal')
          ),
          h('button', {
            className: `portal-tab-btn ${portalRole === 'admin' ? 'active admin' : ''}`,
            onClick: () => { setPortalRole('admin'); setAuthError(null); }
          },
            h('span', { style: { fontSize: '1.2rem' } }, '🛡️'),
            h('span', null, 'Admin Portal')
          )
        ),

        // Portal Information & Instructions
        h('div', { className: `portal-info-box ${portalRole}` },
          portalRole === 'student' && '🎓 Log in using your Student Roll ID (e.g. 241FA04A76) or Student Email to check schedules, submit reservations, and view RFID attendance.',
          portalRole === 'faculty' && '👨‍🏫 Log in using your Faculty ID (e.g. FAC-204) or Faculty Email to manage smart classrooms, view timetables, and approve bookings.',
          portalRole === 'admin' && '🛡️ Administrative portal for master campus IoT controls, issue resolution, and system circular broadcasts.'
        ),

        // Auth Error Box
        authError && h('div', { className: 'auth-error-box' },
          h('span', null, '⚠️'),
          h('span', null, authError)
        ),

        // LOGIN FORM
        !isRegisterMode ? h('form', { onSubmit: handleLoginSubmit },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' },
              portalRole === 'student' ? 'Student Roll ID or Email' :
              portalRole === 'faculty' ? 'Faculty Employee ID or Email' : 'Administrator Email'
            ),
            h('input', {
              type: 'text',
              name: 'identifier',
              required: true,
              placeholder: portalRole === 'student' ? 'e.g. 241FA04A76 or aarav.cs22@smartcampus.edu' :
                           portalRole === 'faculty' ? 'e.g. FAC-204 or anita.desai@smartcampus.edu' :
                           'admin@smartcampus.edu',
              className: 'form-input'
            })
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Password'),
            h('input', {
              type: 'password',
              name: 'password',
              required: true,
              placeholder: '••••••••',
              className: 'form-input'
            })
          ),
          h('button', {
            type: 'submit',
            className: 'btn-primary',
            style: { width: '100%', marginTop: '8px', padding: '12px' },
            disabled: authLoading
          },
            authLoading ? 'Verifying Credentials...' : `Log In to ${portalRole.toUpperCase()} Portal →`
          ),

          // Quick Demo 1-Click Credentials
          h('div', { className: 'demo-credentials-card' },
            h('div', { className: 'demo-title' },
              h('span', null, '⚡ Quick Demo Evaluation'),
              h('span', { style: { fontSize: '0.7rem', color: '#38bdf8' } }, '1-Click Login')
            ),
            h('button', {
              type: 'button',
              className: 'btn-quick-fill',
              onClick: () => handleQuickDemoLogin(portalRole)
            },
              portalRole === 'student' ? 'Log in as Aarav Patel (CS302 Student)' :
              portalRole === 'faculty' ? 'Log in as Prof. Anita Desai (CSE Faculty)' :
              'Log in as Dr. Rajesh Sharma (Admin)'
            )
          ),

          // Register Toggle
          portalRole !== 'admin' && h('div', { style: { textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: '#94a3b8' } },
            'New campus member? ',
            h('a', {
              href: '#',
              style: { color: '#60a5fa', fontWeight: 600, textDecoration: 'none' },
              onClick: (e) => { e.preventDefault(); setIsRegisterMode(true); setAuthError(null); }
            }, `Register ${portalRole.toUpperCase()} Account`)
          )
        ) :
        // REGISTRATION FORM
        h('form', { onSubmit: handleRegisterSubmit },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Full Name'),
            h('input', { type: 'text', name: 'name', required: true, placeholder: 'e.g. John Doe', className: 'form-input' })
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Campus Email'),
            h('input', { type: 'email', name: 'email', required: true, placeholder: 'john@smartcampus.edu', className: 'form-input' })
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Password'),
            h('input', { type: 'password', name: 'password', required: true, placeholder: 'Create password', className: 'form-input' })
          ),
          portalRole === 'student' ?
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Student Roll ID'),
              h('input', { type: 'text', name: 'studentId', required: true, placeholder: 'e.g. 241FA04A99', className: 'form-input' })
            ) :
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Faculty Employee ID'),
              h('input', { type: 'text', name: 'employeeId', required: true, placeholder: 'e.g. FAC-401', className: 'form-input' })
            ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Department'),
            h('input', { type: 'text', name: 'department', defaultValue: 'Computer Science & Engineering', className: 'form-input' })
          ),
          h('button', {
            type: 'submit',
            className: 'btn-primary',
            style: { width: '100%', marginTop: '8px', padding: '12px' },
            disabled: authLoading
          },
            authLoading ? 'Registering...' : `Create ${portalRole.toUpperCase()} Account`
          ),
          h('div', { style: { textAlign: 'center', marginTop: '16px', fontSize: '0.82rem', color: '#94a3b8' } },
            'Already have an account? ',
            h('a', {
              href: '#',
              style: { color: '#60a5fa', fontWeight: 600, textDecoration: 'none' },
              onClick: (e) => { e.preventDefault(); setIsRegisterMode(false); setAuthError(null); }
            }, 'Back to Login')
          )
        )
      ),

      // Toast Notification Container
      toast && h('div', { className: 'toast-container' },
        h('div', { className: 'toast' },
          h('span', { style: { fontSize: '1.2rem' } }, '🔔'),
          h('span', null, toast)
        )
      )
    );
  }

  // ==============================================================
  // VIEW 2: AUTHENTICATED DASHBOARD (Logged-in view with Logout)
  // ==============================================================
  return h('div', null,
    // HEADER & NAVBAR WITH LOGOUT
    h('header', { className: 'navbar' },
      h('div', { className: 'brand' },
        h('div', { className: 'brand-icon' }, '🏫'),
        h('div', null,
          h('div', { className: 'brand-title' }, 'SMART CAMPUS OS'),
          h('div', { className: 'brand-subtitle' }, `Portal: ${currentUser.role.toUpperCase()} MODE`)
        )
      ),
      h('div', { className: 'nav-user-area' },
        h('div', { className: 'online-pill' },
          h('div', { className: 'pulse-dot' }),
          'Live Grid'
        ),
        // User Profile Badge
        h('div', { className: 'user-badge-container' },
          h('div', { className: 'user-avatar-circle' }, currentUser.name.charAt(0)),
          h('div', null,
            h('div', { className: 'user-name-text' }, currentUser.name),
            h('div', { style: { fontSize: '0.72rem', color: '#94a3b8' } },
              currentUser.role === 'student' ? `Roll: ${currentUser.studentId || '241FA04A76'}` :
              currentUser.role === 'faculty' ? `ID: ${currentUser.employeeId || 'FAC-204'}` :
              'Administrator'
            )
          ),
          h('span', { className: `user-role-tag ${currentUser.role}` }, currentUser.role)
        ),
        // Dedicated Logout Button
        h('button', {
          className: 'btn-logout',
          onClick: handleLogout,
          title: 'Sign out and return to portal login'
        },
          h('span', null, '🚪'),
          h('span', null, 'Logout')
        )
      )
    ),

    // MAIN CONTAINER
    h('main', { className: 'main-container' },
      // NAVIGATION TABS
      h('div', { className: 'tabs-bar' },
        [
          { id: 'overview', label: '📊 Campus Overview' },
          { id: 'facilities', label: '💡 Smart Classrooms & IoT' },
          { id: 'bookings', label: '📅 Facility Bookings' },
          { id: 'grievances', label: '🛠️ Maintenance Tickets' },
          { id: 'notices', label: '📢 Notice Board' },
          { id: 'attendance', label: '📱 Smart RFID Attendance' }
        ].map(tab =>
          h('button', {
            key: tab.id,
            className: `tab-btn ${activeTab === tab.id ? 'active' : ''}`,
            onClick: () => setActiveTab(tab.id)
          }, tab.label)
        )
      ),

      // TAB 1: OVERVIEW DASHBOARD
      activeTab === 'overview' && h('div', null,
        // Role Welcome Banner
        h('div', {
          style: {
            background: currentUser.role === 'student' ? 'linear-gradient(135deg, #1e3a8a, #0f172a)' :
                        currentUser.role === 'faculty' ? 'linear-gradient(135deg, #3b0764, #0f172a)' :
                        'linear-gradient(135deg, #064e3b, #0f172a)',
            border: '1px solid #334155',
            borderRadius: '16px',
            padding: '22px 28px',
            marginBottom: '26px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '16px'
          }
        },
          h('div', null,
            h('h2', { style: { fontSize: '1.35rem', marginBottom: '6px' } }, 
              `Welcome, ${currentUser.name} (${currentUser.role.toUpperCase()})`
            ),
            h('p', { style: { color: '#cbd5e1', fontSize: '0.88rem' } },
              currentUser.role === 'student' ? 'You have access to classroom IoT status, facility reservations, maintenance complaint logging, and RFID attendance.' :
              currentUser.role === 'faculty' ? 'You have access to smart classroom controls, laboratory scheduling, reservation approvals, and class attendance.' :
              'Master administrator access to campus power telemetry, grievance redressal, and timetable conflict oversight.'
            )
          ),
          h('div', { style: { display: 'flex', gap: '10px' } },
            h('button', {
              className: 'btn-secondary',
              onClick: () => setActiveTab('facilities')
            }, 'Explore Facilities →'),
            h('button', {
              className: 'btn-primary',
              onClick: () => {
                setSelectedFacilityForBooking(null);
                setShowBookingModal(true);
              }
            }, '+ Book Facility')
          )
        ),

        // KPI Stats Row
        stats && h('div', { className: 'stats-grid' },
          h('div', { className: 'stat-card' },
            h('div', { className: 'stat-header' }, 'Smart Facilities', h('span', { className: 'stat-icon' }, '🏢')),
            h('div', { className: 'stat-value' }, stats.facilities.total),
            h('div', { className: 'stat-footer' }, `${stats.facilities.occupied} Occupied • ${stats.facilities.available} Available`)
          ),
          h('div', { className: 'stat-card' },
            h('div', { className: 'stat-header' }, 'Campus Power Load', h('span', { className: 'stat-icon' }, '⚡')),
            h('div', { className: 'stat-value', style: { color: '#fbbf24' } }, `${stats.energy.totalPowerKw} kW`),
            h('div', { className: 'stat-footer' }, `${stats.energy.activeAcCount} ACs • ${stats.energy.activeLightsCount} Smart Lights active`)
          ),
          h('div', { className: 'stat-card' },
            h('div', { className: 'stat-header' }, 'Active Reservations', h('span', { className: 'stat-icon' }, '📅')),
            h('div', { className: 'stat-value', style: { color: '#60a5fa' } }, stats.bookings.todayCount),
            h('div', { className: 'stat-footer' }, `${stats.bookings.pendingApprovals} Pending Approvals`)
          ),
          h('div', { className: 'stat-card' },
            h('div', { className: 'stat-header' }, 'Maintenance Tickets', h('span', { className: 'stat-icon' }, '🔧')),
            h('div', { className: 'stat-value', style: { color: stats.grievances.open > 0 ? '#f87171' : '#34d399' } }, stats.grievances.open),
            h('div', { className: 'stat-footer' }, `${stats.grievances.resolved} issues resolved`)
          ),
          h('div', { className: 'stat-card' },
            h('div', { className: 'stat-header' }, 'RFID Attendance', h('span', { className: 'stat-icon' }, '📈')),
            h('div', { className: 'stat-value', style: { color: '#34d399' } }, `${stats.attendance.rate}%`),
            h('div', { className: 'stat-footer' }, `${stats.attendance.recordsCount} RFID logs recorded`)
          )
        ),

        // Recent Circulars & Active Tickets Grid
        h('div', { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '24px', marginTop: '24px' } },
          // Recent Notices
          h('div', { className: 'table-container', style: { padding: '20px' } },
            h('h4', { style: { marginBottom: '14px', fontSize: '1rem' } }, '📢 Campus Announcements'),
            notices.slice(0, 3).map(n =>
              h('div', { key: n._id, style: { borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '12px' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('strong', { style: { fontSize: '0.92rem', color: '#60a5fa' } }, n.title),
                  n.pinned && h('span', { style: { fontSize: '0.72rem', background: '#3b82f6', color: 'white', padding: '2px 6px', borderRadius: '4px' } }, 'PINNED')
                ),
                h('p', { style: { fontSize: '0.82rem', color: '#94a3b8', marginTop: '4px' } }, n.content.substring(0, 110) + '...'),
                h('div', { style: { fontSize: '0.74rem', color: '#64748b', marginTop: '4px' } }, `Posted by ${n.postedBy}`)
              )
            )
          ),
          // Active Maintenance Requests
          h('div', { className: 'table-container', style: { padding: '20px' } },
            h('h4', { style: { marginBottom: '14px', fontSize: '1rem' } }, '🛠️ Open Campus Maintenance Requests'),
            grievances.slice(0, 3).map(g =>
              h('div', { key: g._id, style: { borderBottom: '1px solid #1e293b', paddingBottom: '12px', marginBottom: '12px' } },
                h('div', { style: { display: 'flex', justifyContent: 'space-between' } },
                  h('strong', { style: { fontSize: '0.92rem' } }, g.title),
                  h('span', { className: `priority-tag ${g.priority}` }, g.priority)
                ),
                h('div', { style: { fontSize: '0.82rem', color: '#94a3b8', margin: '4px 0' } }, `📍 ${g.location}`),
                h('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: '#64748b' } },
                  h('span', null, `Reported by ${g.reportedBy}`),
                  h('span', { className: `status-badge ${g.status.replace(' ', '-')}` }, g.status)
                )
              )
            )
          )
        )
      ),

      // TAB 2: SMART CLASSROOMS & IOT CONTROLS
      activeTab === 'facilities' && h('div', null,
        h('div', { className: 'section-header' },
          h('div', null,
            h('h2', { className: 'section-title' }, 'Smart Facilities & IoT Automation'),
            h('p', { className: 'section-subtitle' }, 'Real-time telemetry, smart lighting, climate sensors, and interactive equipment control.')
          ),
          h('div', { style: { display: 'flex', gap: '10px' } },
            h('select', {
              className: 'form-select',
              style: { width: 'auto' },
              value: facilityFilter,
              onChange: (e) => setFacilityFilter(e.target.value)
            },
              h('option', { value: 'All' }, 'All Facilities'),
              h('option', { value: 'Classroom' }, 'Classrooms'),
              h('option', { value: 'Lab' }, 'Laboratories'),
              h('option', { value: 'Auditorium' }, 'Auditorium'),
              h('option', { value: 'Conference Room' }, 'Conference Rooms'),
              h('option', { value: 'Library' }, 'Library')
            ),
            h('button', {
              className: 'btn-primary',
              onClick: () => {
                setSelectedFacilityForBooking(null);
                setShowBookingModal(true);
              }
            }, '+ Reserve a Room')
          )
        ),

        // Facility Cards Grid
        h('div', { className: 'facilities-grid' },
          facilities
            .filter(f => facilityFilter === 'All' || f.type === facilityFilter)
            .map(fac =>
              h('div', { key: fac._id, className: 'facility-card' },
                h('div', { className: 'facility-top' },
                  h('div', null,
                    h('div', { style: { display: 'flex', alignItems: 'center' } },
                      h('span', { className: 'facility-name' }, fac.name),
                      h('span', { className: 'facility-code' }, fac.code)
                    ),
                    h('div', { className: 'facility-loc' }, `🏢 ${fac.block} • Floor ${fac.floor} • Capacity: ${fac.capacity} students`)
                  ),
                  h('span', {
                    className: `occupancy-badge ${fac.isOccupied ? 'occupied' : 'available'}`,
                    style: { cursor: 'pointer' },
                    onClick: () => handleOccupancyToggle(fac._id, fac.isOccupied),
                    title: 'Click to toggle occupancy simulation'
                  }, fac.isOccupied ? 'Occupied' : 'Available')
                ),

                h('div', { className: 'current-activity' },
                  h('strong', null, 'Current Session: '),
                  fac.currentActivity
                ),

                // IoT Controls Panel
                h('div', { className: 'iot-controls-box' },
                  h('div', { className: 'iot-header' },
                    h('span', null, 'IoT Device Relays'),
                    h('span', { className: 'power-meter' }, `⚡ ${fac.powerConsumption} kW`)
                  ),
                  h('div', { className: 'iot-switches-grid' },
                    // Smart Lights
                    h('button', {
                      className: `iot-switch-btn ${fac.smartDevices.lights ? 'active' : ''}`,
                      onClick: () => handleIoTDeviceToggle(fac._id, 'lights', fac.smartDevices.lights)
                    },
                      h('span', null, '💡 Lights'),
                      h('div', { className: 'iot-dot' })
                    ),
                    // Air Conditioner
                    h('button', {
                      className: `iot-switch-btn ${fac.smartDevices.airConditioner ? 'active' : ''}`,
                      onClick: () => handleIoTDeviceToggle(fac._id, 'airConditioner', fac.smartDevices.airConditioner)
                    },
                      h('span', null, `❄️ AC (${fac.smartDevices.acTemperature || 24}°C)`),
                      h('div', { className: 'iot-dot' })
                    ),
                    // Projector
                    h('button', {
                      className: `iot-switch-btn ${fac.smartDevices.projector ? 'active' : ''}`,
                      onClick: () => handleIoTDeviceToggle(fac._id, 'projector', fac.smartDevices.projector)
                    },
                      h('span', null, '📽️ Projector'),
                      h('div', { className: 'iot-dot' })
                    ),
                    // Smart Board
                    h('button', {
                      className: `iot-switch-btn ${fac.smartDevices.smartBoard ? 'active' : ''}`,
                      onClick: () => handleIoTDeviceToggle(fac._id, 'smartBoard', fac.smartDevices.smartBoard)
                    },
                      h('span', null, '🖥️ Smart Board'),
                      h('div', { className: 'iot-dot' })
                    ),
                    // Smart Lock
                    h('button', {
                      className: `iot-switch-btn ${!fac.smartDevices.doorLock ? 'active' : ''}`,
                      onClick: () => handleIoTDeviceToggle(fac._id, 'doorLock', fac.smartDevices.doorLock)
                    },
                      h('span', null, fac.smartDevices.doorLock ? '🔒 Locked' : '🔓 Unlocked'),
                      h('div', { className: 'iot-dot' })
                    ),
                    // Eco Standby Mode
                    h('button', {
                      className: 'iot-switch-btn',
                      onClick: () => {
                        handleIoTDeviceToggle(fac._id, 'lights', true);
                        handleIoTDeviceToggle(fac._id, 'airConditioner', true);
                        showToast(`Eco Mode applied to ${fac.name}`);
                      }
                    },
                      h('span', null, '🌿 Eco Sleep'),
                      h('span', { style: { fontSize: '0.7rem', color: '#10b981' } }, 'AUTO')
                    )
                  )
                ),

                // Amenities
                h('div', { className: 'amenities-list' },
                  fac.amenities.map((a, i) =>
                    h('span', { key: i, className: 'amenity-chip' }, a)
                  )
                ),

                // Book Button
                h('button', {
                  className: 'btn-secondary',
                  style: { marginTop: 'auto', width: '100%' },
                  onClick: () => {
                    setSelectedFacilityForBooking(fac);
                    setShowBookingModal(true);
                  }
                }, `📅 Book ${fac.code}`)
              )
            )
        )
      ),

      // TAB 3: BOOKINGS
      activeTab === 'bookings' && h('div', null,
        h('div', { className: 'section-header' },
          h('div', null,
            h('h2', { className: 'section-title' }, 'Facility Reservations & Timetables'),
            h('p', { className: 'section-subtitle' }, 'Automated conflict checking prevents overlapping class schedules.')
          ),
          h('button', {
            className: 'btn-primary',
            onClick: () => {
              setSelectedFacilityForBooking(null);
              setShowBookingModal(true);
            }
          }, '+ New Reservation')
        ),

        h('div', { className: 'table-container' },
          h('table', { className: 'custom-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Facility'),
                h('th', null, 'Booked By'),
                h('th', null, 'Date & Time Slot'),
                h('th', null, 'Purpose'),
                h('th', null, 'Expected Count'),
                h('th', null, 'Status'),
                h('th', null, 'Actions')
              )
            ),
            h('tbody', null,
              bookings.map(b =>
                h('tr', { key: b._id },
                  h('td', null,
                    h('strong', null, b.facilityName),
                    h('div', { style: { fontSize: '0.76rem', color: '#38bdf8' } }, b.facilityCode)
                  ),
                  h('td', null,
                    h('div', null, b.userName),
                    h('div', { style: { fontSize: '0.76rem', color: '#94a3b8' } }, `${b.userRole.toUpperCase()} • ${b.userEmail}`)
                  ),
                  h('td', null,
                    h('div', null, b.date),
                    h('div', { style: { fontSize: '0.8rem', color: '#fbbf24' } }, `⏰ ${b.startTime} - ${b.endTime}`)
                  ),
                  h('td', { style: { maxWidth: '240px' } }, b.purpose),
                  h('td', null, `${b.attendeesCount} pax`),
                  h('td', null,
                    h('span', { className: `status-badge ${b.status}` }, b.status)
                  ),
                  h('td', null,
                    // If Admin or Faculty, allow approval
                    (currentUser.role === 'admin' || currentUser.role === 'faculty') && b.status === 'Pending' ?
                      h('div', { style: { display: 'flex', gap: '6px' } },
                        h('button', {
                          className: 'btn-primary',
                          style: { padding: '4px 10px', fontSize: '0.78rem' },
                          onClick: () => handleUpdateBookingStatus(b._id, 'Approved')
                        }, 'Approve'),
                        h('button', {
                          className: 'btn-secondary',
                          style: { padding: '4px 10px', fontSize: '0.78rem', color: '#f87171' },
                          onClick: () => handleUpdateBookingStatus(b._id, 'Rejected')
                        }, 'Reject')
                      ) :
                    b.status !== 'Cancelled' ?
                      h('button', {
                        className: 'btn-secondary',
                        style: { padding: '4px 10px', fontSize: '0.78rem', color: '#f87171' },
                        onClick: () => handleUpdateBookingStatus(b._id, 'Cancelled')
                      }, 'Cancel') :
                      h('span', { style: { color: '#64748b', fontSize: '0.8rem' } }, 'Completed')
                  )
                )
              )
            )
          )
        )
      ),

      // TAB 4: GRIEVANCES & MAINTENANCE
      activeTab === 'grievances' && h('div', null,
        h('div', { className: 'section-header' },
          h('div', null,
            h('h2', { className: 'section-title' }, 'Smart Campus Grievance Redressal'),
            h('p', { className: 'section-subtitle' }, 'Report and track infrastructure, IT, projector, and electrical complaints.')
          ),
          h('div', { style: { display: 'flex', gap: '10px' } },
            h('select', {
              className: 'form-select',
              style: { width: 'auto' },
              value: grievanceFilter,
              onChange: (e) => setGrievanceFilter(e.target.value)
            },
              h('option', { value: 'All' }, 'All Tickets'),
              h('option', { value: 'Open' }, 'Open'),
              h('option', { value: 'In Progress' }, 'In Progress'),
              h('option', { value: 'Resolved' }, 'Resolved')
            ),
            h('button', {
              className: 'btn-primary',
              onClick: () => setShowGrievanceModal(true)
            }, '+ Report Issue')
          )
        ),

        h('div', { className: 'tickets-grid' },
          grievances
            .filter(g => grievanceFilter === 'All' || g.status === grievanceFilter)
            .map(ticket =>
              h('div', { key: ticket._id, className: 'ticket-card' },
                h('div', { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px' } },
                  h('div', null,
                    h('span', { className: `priority-tag ${ticket.priority}` }, ticket.priority),
                    h('span', { style: { fontSize: '0.78rem', color: '#94a3b8', marginLeft: '8px' } }, ticket.category)
                  ),
                  h('span', { className: `status-badge ${ticket.status.replace(' ', '-')}` }, ticket.status)
                ),
                h('h4', { style: { fontSize: '1.05rem', margin: '4px 0 8px' } }, ticket.title),
                h('p', { style: { fontSize: '0.84rem', color: '#cbd5e1', marginBottom: '12px' } }, ticket.description),
                h('div', { style: { fontSize: '0.8rem', color: '#38bdf8', marginBottom: '8px' } }, `📍 Location: ${ticket.location}`),
                
                ticket.resolutionNotes && h('div', {
                  style: {
                    background: 'rgba(16, 185, 129, 0.1)',
                    borderLeft: '3px solid #10b981',
                    padding: '8px 12px',
                    fontSize: '0.8rem',
                    color: '#a7f3d0',
                    margin: '8px 0',
                    borderRadius: '0 4px 4px 0'
                  }
                },
                  h('strong', null, 'Resolution: '),
                  ticket.resolutionNotes
                ),

                h('div', { style: { marginTop: 'auto', paddingTop: '14px', borderTop: '1px solid #1e293b', display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
                  h('div', { style: { fontSize: '0.74rem', color: '#64748b' } }, `Reported by ${ticket.reportedBy}`),
                  currentUser.role === 'admin' && ticket.status !== 'Resolved' && h('button', {
                    className: 'btn-secondary',
                    style: { padding: '4px 10px', fontSize: '0.78rem', color: '#34d399' },
                    onClick: () => handleResolveGrievance(ticket._id)
                  }, '✓ Mark Resolved')
                )
              )
            )
        )
      ),

      // TAB 5: NOTICE BOARD
      activeTab === 'notices' && h('div', null,
        h('div', { className: 'section-header' },
          h('div', null,
            h('h2', { className: 'section-title' }, 'Campus Digital Notice Board'),
            h('p', { className: 'section-subtitle' }, 'Official university alerts, event circulars, and maintenance advisories.')
          ),
          (currentUser.role === 'admin' || currentUser.role === 'faculty') && h('button', {
            className: 'btn-primary',
            onClick: () => setShowNoticeModal(true)
          }, '+ Broadcast Notice')
        ),

        h('div', { className: 'notices-grid' },
          notices.map(notice =>
            h('div', { key: notice._id, className: `notice-card ${notice.pinned ? 'pinned' : ''}` },
              notice.pinned && h('span', { className: 'pin-icon' }, '📌 PINNED'),
              h('div', { style: { display: 'flex', gap: '8px', marginBottom: '8px' } },
                h('span', { style: { background: '#1e293b', color: '#38bdf8', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' } }, notice.category),
                notice.priority === 'Urgent' && h('span', { style: { background: '#ef4444', color: 'white', fontSize: '0.75rem', padding: '3px 8px', borderRadius: '4px' } }, 'URGENT')
              ),
              h('h3', { style: { fontSize: '1.15rem', marginBottom: '10px' } }, notice.title),
              h('p', { style: { fontSize: '0.88rem', color: '#cbd5e1', lineHeight: '1.5', marginBottom: '16px' } }, notice.content),
              h('div', { style: { fontSize: '0.78rem', color: '#64748b', borderTop: '1px solid #1e293b', paddingTop: '10px' } },
                `Issued by: ${notice.postedBy} • Audience: ${notice.targetAudience}`
              )
            )
          )
        )
      ),

      // TAB 6: SMART RFID ATTENDANCE
      activeTab === 'attendance' && h('div', null,
        h('div', { className: 'section-header' },
          h('div', null,
            h('h2', { className: 'section-title' }, 'RFID Smart ID Card & Attendance System'),
            h('p', { className: 'section-subtitle' }, 'Simulate contactless RFID/NFC smart ID card tapping at lecture hall entrance terminals.')
          ),
          h('button', {
            className: 'btn-primary',
            style: { background: 'linear-gradient(135deg, #10b981, #059669)' },
            onClick: handleSimulateRfidTap
          }, '📲 Tap Smart ID Card (Simulate)')
        ),

        // Attendance Ledger Table
        h('div', { className: 'table-container' },
          h('table', { className: 'custom-table' },
            h('thead', null,
              h('tr', null,
                h('th', null, 'Student Name'),
                h('th', null, 'Student Roll ID'),
                h('th', null, 'Course Code & Name'),
                h('th', null, 'Date'),
                h('th', null, 'RFID Tap Timestamp'),
                h('th', null, 'Gate Terminal'),
                h('th', null, 'Status')
              )
            ),
            h('tbody', null,
              attendance.map(record =>
                h('tr', { key: record._id },
                  h('td', null, h('strong', null, record.studentName)),
                  h('td', null, h('span', { style: { color: '#38bdf8' } }, record.studentId)),
                  h('td', null, `${record.courseCode} - ${record.courseName}`),
                  h('td', null, record.date),
                  h('td', null, record.rfidTapTime || '--'),
                  h('td', null, record.markedBy),
                  h('td', null,
                    h('span', { className: `status-badge ${record.status}` }, record.status)
                  )
                )
              )
            )
          )
        )
      )
    ),

    // MODAL 1: BOOKING MODAL
    showBookingModal && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-content' },
        h('div', { className: 'modal-header' },
          h('h3', null, '📅 Reserve Campus Facility'),
          h('button', { className: 'close-btn', onClick: () => setShowBookingModal(false) }, '×')
        ),
        h('form', { onSubmit: handleCreateBooking },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Select Facility / Room'),
            h('select', {
              className: 'form-select',
              name: 'facilityId',
              defaultValue: selectedFacilityForBooking ? selectedFacilityForBooking._id : facilities[0]?._id
            },
              facilities.map(f =>
                h('option', { key: f._id, value: f._id }, `${f.name} (${f.code}) - ${f.block}`)
              )
            )
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Reservation Date'),
            h('input', {
              type: 'date',
              name: 'date',
              required: true,
              className: 'form-input',
              defaultValue: new Date().toISOString().slice(0, 10)
            })
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Start Time'),
              h('input', { type: 'time', name: 'startTime', required: true, className: 'form-input', defaultValue: '10:00' })
            ),
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'End Time'),
              h('input', { type: 'time', name: 'endTime', required: true, className: 'form-input', defaultValue: '12:00' })
            )
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Event Purpose / Lecture Topic'),
            h('input', {
              type: 'text',
              name: 'purpose',
              required: true,
              placeholder: 'e.g. AI/ML Special Guest Workshop',
              className: 'form-input'
            })
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Estimated Attendees'),
            h('input', {
              type: 'number',
              name: 'attendeesCount',
              className: 'form-input',
              defaultValue: 40
            })
          ),
          h('button', { type: 'submit', className: 'btn-primary', style: { width: '100%', marginTop: '10px' } },
            'Verify & Confirm Booking'
          )
        )
      )
    ),

    // MODAL 2: GRIEVANCE MODAL
    showGrievanceModal && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-content' },
        h('div', { className: 'modal-header' },
          h('h3', null, '🛠️ Report Campus Maintenance Issue'),
          h('button', { className: 'close-btn', onClick: () => setShowGrievanceModal(false) }, '×')
        ),
        h('form', { onSubmit: handleCreateGrievance },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Issue Title'),
            h('input', {
              type: 'text',
              name: 'title',
              required: true,
              placeholder: 'e.g. Smart Projector Bulb Failure',
              className: 'form-input'
            })
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Category'),
              h('select', { name: 'category', className: 'form-select' },
                h('option', null, 'IT & Projector'),
                h('option', null, 'Electrical / Lighting'),
                h('option', null, 'HVAC / Air Conditioning'),
                h('option', null, 'Plumbing / Water'),
                h('option', null, 'Smart Access & Security'),
                h('option', null, 'Cleanliness')
              )
            ),
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Priority Level'),
              h('select', { name: 'priority', className: 'form-select' },
                h('option', null, 'Low'),
                h('option', { selected: true }, 'Medium'),
                h('option', null, 'High'),
                h('option', null, 'Emergency')
              )
            )
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Exact Location / Room Code'),
            h('input', {
              type: 'text',
              name: 'location',
              required: true,
              placeholder: 'e.g. Block B, Lab 204 or Corridor 2nd Floor',
              className: 'form-input'
            })
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Problem Description'),
            h('textarea', {
              name: 'description',
              required: true,
              rows: 3,
              placeholder: 'Provide details about the malfunction...',
              className: 'form-textarea'
            })
          ),
          h('button', { type: 'submit', className: 'btn-primary', style: { width: '100%', marginTop: '10px' } },
            'Submit Maintenance Ticket'
          )
        )
      )
    ),

    // MODAL 3: NOTICE BROADCAST MODAL
    showNoticeModal && h('div', { className: 'modal-overlay' },
      h('div', { className: 'modal-content' },
        h('div', { className: 'modal-header' },
          h('h3', null, '📢 Broadcast Campus Announcement'),
          h('button', { className: 'close-btn', onClick: () => setShowNoticeModal(false) }, '×')
        ),
        h('form', { onSubmit: handleCreateNotice },
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Announcement Title'),
            h('input', {
              type: 'text',
              name: 'title',
              required: true,
              placeholder: 'e.g. Campus Green Energy Drive',
              className: 'form-input'
            })
          ),
          h('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' } },
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Category'),
              h('select', { name: 'category', className: 'form-select' },
                h('option', null, 'Smart Campus Alert'),
                h('option', null, 'Academic'),
                h('option', null, 'Events & Workshops'),
                h('option', null, 'Maintenance'),
                h('option', null, 'General')
              )
            ),
            h('div', { className: 'form-group' },
              h('label', { className: 'form-label' }, 'Priority'),
              h('select', { name: 'priority', className: 'form-select' },
                h('option', null, 'Normal'),
                h('option', null, 'Important'),
                h('option', null, 'Urgent')
              )
            )
          ),
          h('div', { className: 'form-group' },
            h('label', { className: 'form-label' }, 'Notice Content / Circular Text'),
            h('textarea', {
              name: 'content',
              required: true,
              rows: 4,
              placeholder: 'Type announcement details...',
              className: 'form-textarea'
            })
          ),
          h('div', { className: 'form-group', style: { display: 'flex', alignItems: 'center', gap: '8px' } },
            h('input', { type: 'checkbox', name: 'pinned', id: 'pinNotice' }),
            h('label', { htmlFor: 'pinNotice', style: { fontSize: '0.84rem', color: '#cbd5e1' } }, 'Pin to top of notice board')
          ),
          h('button', { type: 'submit', className: 'btn-primary', style: { width: '100%', marginTop: '10px' } },
            'Publish Announcement'
          )
        )
      )
    ),

    // TOAST NOTIFICATION CONTAINER
    toast && h('div', { className: 'toast-container' },
      h('div', { className: 'toast' },
        h('span', { style: { fontSize: '1.2rem' } }, '🔔'),
        h('span', null, toast)
      )
    ),

    // FOOTER
    h('footer', { className: 'footer' },
      `Smart Campus Management System • Logged in as ${currentUser.name} (${currentUser.role.toUpperCase()}) • Pure MERN Stack`
    )
  );
}

// Mount React Root
const rootElement = document.getElementById('root');
if (window.ReactDOM && window.ReactDOM.createRoot) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(h(App));
} else if (window.ReactDOM && window.ReactDOM.render) {
  ReactDOM.render(h(App), rootElement);
}
