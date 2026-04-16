import React, { useState } from 'react';
import { Search, CalendarDays, ClipboardList, UserRound } from 'lucide-react';
import PatientSearch_app from './PatientSearch_app';
import PatientAppointmentList_app from './PatientAppointmentList_app';
import DoctorAppointmentList_app from './DoctorAppointmentList_app';
import './AppointmentMain_app.css';

const AppointmentMain_app = ({ role = 'patient', patientId = "P001", doctorId = "D001" }) => {
    const [activeTab, setActiveTab] = useState(role === 'patient' ? 'search' : 'doctor-view');

    return (
        <div className="wrapper_app">
            <header className="header_app">
                <div className="titleSection_app">
                    <h1>MediSphere <span>Appointments</span></h1>
                    <p>
                        {role === 'patient' 
                            ? "Discover specialists and manage your wellness journey." 
                            : "Manage your clinical schedule and patient consultations."}
                    </p>
                </div>

                {role === 'patient' && (
                    <div className="tabs_app">
                        <button 
                            className={`tabBtn_app ${activeTab === 'search' ? 'active_app' : ''}`}
                            onClick={() => setActiveTab('search')}
                        >
                            <span className="tabIcon_app"><Search size={18} /></span>
                            Search Doctors
                        </button>
                        <button 
                            className={`tabBtn_app ${activeTab === 'list' ? 'active_app' : ''}`}
                            onClick={() => setActiveTab('list')}
                        >
                            <span className="tabIcon_app"><CalendarDays size={18} /></span>
                            My Bookings
                        </button>
                    </div>
                )}
            </header>

            <main className="contentContainer_app">
                {role === 'patient' ? (
                    activeTab === 'search' ? (
                        <PatientSearch_app patientId={patientId} />
                    ) : (
                        <PatientAppointmentList_app patientId={patientId} />
                    )
                ) : (
                    <DoctorAppointmentList_app doctorId={doctorId} />
                )}
            </main>
        </div>
    );
};

export default AppointmentMain_app;
