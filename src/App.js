import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';

// Layout Components
import Navbar_panav from './Components/Patient/Navbar_panav';
import Footer_pafoot from './Components/Patient/Footer_pafoot';

// Patient Components
import PatientDashboard_padashboard from './Components/Patient/PatientDashboard_padashboard';
import PatientProfile_paprofile from './Components/Patient/PatientProfile_paprofile';
import PatientBooking_paAppoinmant from './Components/Patient/PatientBooking_paAppoinmant';
import PatientHistory_pahistory from './Components/Patient/PatientHistory_pahistory';
import PatientReports_pareports from './Components/Patient/PatientReports_pareports';
import PatientPrescriptions_paprescription from './Components/Patient/PatientPrescriptions_paprescription';

// Auth Components
import Login from './Components/Login/Login';
import Registration from './Components/Registration/Registration';

// Doctor Components
import DoctorNavbar_donv from './Components/Doctor/DoctorNavbar_donv';
import DoctorDashboard_dodsh from './Components/Doctor/DoctorDashboard_dodsh';
import DoctorProfile_doprof from './Components/Doctor/DoctorProfile_doprof';
import DoctorAppointments_doappt from './Components/Doctor/DoctorAppointments_doappt';
import PatientReportViewer_dorep from './Components/Doctor/PatientReportViewer_dorep';
// Admin Components
import AdminNavbar_admin from './Components/NavBar/AdminNavbar_admin';
import AdminDashboard_admin from './Components/Admin/AdminDashboard_admin';
import PendingApprovals_admin from './Components/Admin/PendingApprovals_admin';
import DoctorReports_admin from './Components/Admin/DoctorReports_admin';
import AdminLogin from './Components/Admin/AdminLogin';
import Splash from './Components/Splash/Splash';

import './App.css';

// Inner App that has access to AuthContext
function AppContent() {
  const { user, isLoggedIn } = useAuth();

  const isDoctorPath = window.location.pathname.startsWith('/doctor');
  const isAdminPath = window.location.pathname.startsWith('/admin');
  const isAuthPath = window.location.pathname === '/' || 
                    window.location.pathname === '/login' || 
                    window.location.pathname === '/register' || 
                    window.location.pathname === '/admin/login';

  return (
    <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Conditional Navigation */}
      <Routes>
        <Route path="/doctor/*" element={<DoctorNavbar_donv />} />
        <Route path="/admin/login" element={<Navbar_panav />} />
        <Route path="/admin/*" element={<AdminNavbar_admin />} />
        <Route path="/*" element={<Navbar_panav />} />
      </Routes>

      <main className="content_main" style={{ 
        flexGrow: 1, 
        marginLeft: (isAdminPath && !isAuthPath) ? '260px' : '0',
        transition: 'margin-left 0.3s ease'
      }}>
        <Routes>
          {/* Default root: redirect based on auth state */}
          <Route
            path="/"
            element={
              isLoggedIn()
                ? user.role === 'ADMIN'
                  ? <Navigate to="/admin/dashboard" replace />
                  : user.role === 'DOCTOR'
                    ? <Navigate to={`/doctor/dashboard/${user.msUserId}`} replace />
                    : <Navigate to={`/dashboard/${user.patientId}`} replace />
                : <Splash />
            }
          />

          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/register" element={<Registration />} />

          {/* Patient Routes — all use dynamic :patientId from URL */}
          <Route path="/dashboard/:patientId" element={<PatientDashboard_padashboard />} />
          <Route path="/profile/:patientId" element={<PatientProfile_paprofile />} />
          <Route path="/book/:patientId" element={<PatientBooking_paAppoinmant />} />
          <Route path="/history/:patientId" element={<PatientHistory_pahistory />} />
          <Route path="/reports/:patientId" element={<PatientReports_pareports />} />
          <Route path="/prescriptions/:patientId" element={<PatientPrescriptions_paprescription />} />

          {/* Doctor Routes — all use dynamic :doctorId from URL */}
          <Route path="/doctor/dashboard/:doctorId" element={<DoctorDashboard_dodsh />} />
          <Route path="/doctor/profile/:doctorId" element={<DoctorProfile_doprof />} />
          <Route path="/doctor/appointments/:doctorId" element={<DoctorAppointments_doappt />} />
          <Route path="/doctor/reports/:doctorId" element={<PatientReportViewer_dorep />} />
          <Route path="/doctor/patients/:doctorId" element={<PatientReportViewer_dorep />} />

          {/* Admin Routes */}
          <Route path="/admin/dashboard" element={<AdminDashboard_admin />} />
          <Route path="/admin/approvals" element={<PendingApprovals_admin />} />
          <Route path="/admin/reports" element={<DoctorReports_admin />} />

          {/* Legacy routes: redirect to login if not authenticated */}
          <Route path="/doctor" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </main>

      {/* Global Footer */}
      {(!isAdminPath || isAuthPath) && <Footer_pafoot />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}

export default App;
