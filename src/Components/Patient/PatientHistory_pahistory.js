import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Calendar, Clock, ChevronRight, Activity, ClipboardList, CheckCircle2, XCircle } from 'lucide-react';
import api from '../../services/api';
import './PatientHistory_pahistory.css';

const PatientHistory_pahistory = ({ patientId: propPatientId = "P002" }) => {
    const { patientId: urlPatientId } = useParams();
    const patientId = urlPatientId || propPatientId;

    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log(`[History] Fetching for Patient ID: ${patientId}`);
        fetchHistory();
    }, [patientId]);

    const fetchHistory = async () => {
        try {
            const response = await api.get(`/appointments/allAppointmentsByPatientId/${patientId}`);
            const finalData = response.data.data || response.data || [];
            setAppointments(Array.isArray(finalData) ? finalData : []);
        } catch (err) {
            console.error('[History] Fetch Error:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case 'Completed': return <CheckCircle2 className="statusIcon_pahistory success_pahistory" />;
            case 'Cancelled': return <XCircle className="statusIcon_pahistory error_pahistory" />;
            default: return <Clock className="statusIcon_pahistory pending_pahistory" />;
        }
    };

    return (
        <div className="container_pahistory">
            {/* Hero Section */}
            <div className="hero_pahistory">
                <div className="heroContent_pahistory">
                    <h1>Your Medical <span>Journey</span></h1>
                    <p>Track your health progress, view past treatments, and access your consultation timeline.</p>
                </div>
                <div className="heroOverlay_pahistory"></div>
            </div>

            {loading ? (
                <div className="loading_pahistory">Fetching history...</div>
            ) : (
                <div className="timeline_pahistory">
                    {appointments.length > 0 ? (
                        appointments.map((app, index) => (
                            <div key={index} className="event_pahistory">
                                <div className="eventMarker_pahistory">
                                    <Activity size={20} />
                                </div>
                                <div className="eventContent_pahistory">
                                    <div className="eventHeader_pahistory">
                                        <h3>Dr. {app.doctorName || 'General Specialist'}</h3>
                                        <span className={`status_pahistory ${app.status?.toLowerCase()}_pahistory`}>
                                            {getStatusIcon(app.status)} {app.status || 'Scheduled'}
                                        </span>
                                    </div>
                                    <div className="eventDetails_pahistory">
                                        <p><Calendar size={14} /> {app.appointmentDate}</p>
                                        <p><Clock size={14} /> {app.appointmentTime}</p>
                                        <p><ClipboardList size={14} /> {app.reason || 'Routine Checkup'}</p>
                                    </div>
                                    {app.status === 'Completed' && (
                                        <button className="viewPresBtn_pahistory">
                                            View Details <ChevronRight size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="noData_pahistory">No medical history found.</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PatientHistory_pahistory;
