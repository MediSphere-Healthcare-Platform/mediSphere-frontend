import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Layout Components
import Navbar_panav from './Components/Patient/Navbar_panav';
import Footer_pafoot from './Components/Patient/Footer_pafoot';

// Patient Components
import PatientConsultation_paconsult from './Components/Patient/PatientConsultation_paconsult';
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
import DoctorSchedule_dosched from './Components/Doctor/DoctorSchedule_dosched';
import DoctorConsultation_docon from './Components/Doctor/DoctorConsultation_docon';
import PatientReportViewer_dorep from './Components/Doctor/PatientReportViewer_dorep';

import './App.css';

function App() {
  const patientId = "P001"; // Mock patient ID
  const doctorId = "D001";  // Mock doctor ID

  // Simple layout switcher based on path
  const isDoctorPath = window.location.pathname.startsWith('/doctor');
  const isAuthPath = window.location.pathname === '/login' || window.location.pathname === '/register';

  return (
    <Router>
      <div className="App" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        {/* Conditional Navigation */}
        {!isAuthPath && (
          <Routes>
            <Route path="/doctor/*" element={<DoctorNavbar_donv />} />
            <Route path="/*" element={<Navbar_panav />} />
          </Routes>
        )}

        <main className="content_main" style={{ flexGrow: 1 }}>
          <Routes>
            {/* Patient Routes */}
            <Route path="/" element={<PatientDashboard_padashboard patientId={patientId} />} />
            <Route path="/profile" element={<PatientProfile_paprofile patientId={patientId} />} />
            <Route path="/book" element={<PatientBooking_paAppoinmant patientId={patientId} />} />
            <Route path="/history" element={<PatientHistory_pahistory patientId={patientId} />} />
            <Route path="/reports" element={<PatientReports_pareports patientId={patientId} />} />
            <Route path="/prescriptions" element={<PatientPrescriptions_paprescription />} />
            <Route path="/consult" element={<PatientConsultation_paconsult />} />

            {/* Auth Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Registration />} />

            {/* Doctor Routes */}
            <Route path="/doctor" element={<DoctorDashboard_dodsh doctorId={doctorId} />} />
            <Route path="/doctor/profile" element={<DoctorProfile_doprof doctorId={doctorId} />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments_doappt doctorId={doctorId} />} />
            <Route path="/doctor/schedule" element={<DoctorSchedule_dosched />} />
            <Route path="/doctor/consult" element={<DoctorConsultation_docon />} />
            <Route path="/doctor/reports" element={<PatientReportViewer_dorep doctorId={doctorId} />} />
            <Route path="/doctor/patients" element={<PatientReportViewer_dorep doctorId={doctorId} />} />
          </Routes>
        </main>

        {/* Global Footer */}
        {!isAuthPath && <Footer_pafoot />}
      </div>
    </Router>
  );
}

export default App;
